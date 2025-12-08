import {
    FederatedPointerEvent,
    ColorSource,
    Point,
    Sprite,
    Texture,
    Color,
    Text,
    Graphics,
    Container
} from "pixi.js";
import { Actions, Interpolations } from "pixi-actions";

import { InitialisedGameClient } from "../Client";
import { TypedEmitter } from "../utils/event-emitter";
import {
    squareToWorldPosition,
    worldToSquarePosition
} from "../utils/world-position";
import { animateAsync } from "../utils/animations";
import { Layer } from "../constants/Layer";
import { squareSize } from "../constants/squares";

export type EntityEvents = {
    hold: () => void;
    drag: (point: Point) => void;
    drop: (point: Point) => void;
    move: (from: Point, to: Point, cancel: () => void) => void;
};

interface EntityOptions {
    client: InitialisedGameClient;
    texture: Texture;
    position: Point;
    size?: number;
    colour?: ColorSource;
    nametag?: string;
    controllable?: boolean;
}

export type SubEntityOptions = Omit<EntityOptions, "texture">;

interface EntityMoveOptions {
    cancellation?: boolean;
    animate?: boolean;
    animationDuration?: number;
    visualOnly?: boolean;
}

interface EntityNametag {
    container?: Container;
    ticker: () => void;
}

export class Entity extends TypedEmitter<EntityEvents> {
    client: InitialisedGameClient;
    sprite: Sprite;

    position: Point;

    private colour: ColorSource;

    private readonly originalSize: number;
    private held = false;
    private dragListener?: (event: FederatedPointerEvent) => void;

    private nametag: EntityNametag = {
        ticker: () => this.nametag.container?.position.set(
            this.sprite.x, this.sprite.y - (squareSize * 0.55)
        )
    };

    constructor(opts: EntityOptions) {
        super();

        this.client = opts.client;
        this.position = opts.position;
        this.originalSize = opts.size || squareSize;
        this.colour = opts.colour || "#ffffff";

        this.sprite = new Sprite({
            texture: opts.texture,
            anchor: 0.5,
            zIndex: Layer.ENTITIES,
            position: squareToWorldPosition(this.position),
            width: this.originalSize,
            height: this.originalSize,
            tint: this.colour,
            eventMode: "dynamic"
        });

        if (opts.nametag) this.setNametag(opts.nametag);

        this.setControllable(opts.controllable || false);
    }

    private set size(size: number) {
        this.sprite.width = this.sprite.height = size;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
    }

    spawn() {
        this.client.viewport.addChild(this.sprite);
        
        return this;
    }

    despawn() {
        if (this.dragListener) this.client.viewport.off(
            "pointermove", this.dragListener
        );

        this.nametag.container?.destroy();
        this.client.app.ticker.remove(this.nametag.ticker);

        this.sprite.destroy();
    }

    setNametag(text: string | undefined) {
        this.nametag.container?.destroy();
        this.client.app.ticker.remove(this.nametag.ticker);
        if (!text) return;

        const nametagPadding = { x: 2.5, y: 1 };

        const textGraphics = new Text({
            text: text,
            style: {
                fill: "#ffffff",
                fontSize: 12,
                padding: 5
            },
            resolution: 2,
            x: nametagPadding.x,
            y: -1
        });
        
        const nametagSize = {
            x: textGraphics.width + nametagPadding.x * 2,
            y: textGraphics.height + nametagPadding.y * 2
        }; 

        const container = new Container({
            zIndex: Layer.HOLOGRAMS,
            pivot: { x: nametagSize.x / 2, y: nametagSize.y / 2 },
            x: this.sprite.x,
            y: this.sprite.y
        });
        this.nametag.container = container;

        container.addChild(new Graphics()
            .rect(0, 0, nametagSize.x, nametagSize.y)
            .fill("#41414170")
        );
        container.addChild(textGraphics);

        this.client.viewport.addChild(container);
        this.client.app.ticker.add(this.nametag.ticker);
    }

    async setPosition(point: Point, opts?: EntityMoveOptions) {
        Actions.clear(this.sprite);

        if (!opts?.visualOnly) this.position = point;

        if (opts?.cancellation) {
            // PLAY A CANCELLATION SOUND OR SOMETHING
            console.log("position set for a move cancellation!");
        }

        const worldPos = squareToWorldPosition(point.x, point.y);

        if (opts?.animate) {
            this.sprite.zIndex = Layer.MOVING_ENTITIES;

            return animateAsync(this.client, Actions.moveTo(
                this.sprite,
                worldPos.x,
                worldPos.y,
                opts.animationDuration || 0.06,
                Interpolations.linear
            )).finally(() => this.sprite.zIndex = Layer.ENTITIES);
        } else {
            this.sprite.position = worldPos;
        }
    }

    async attackSquare(
        squareX: number,
        squareY: number,
        flashEffect = false
    ) {
        const origin = this.position.clone();
        const destination = new Point(squareX, squareY);

        const moveOptions: EntityMoveOptions = {
            animate: true,
            visualOnly: true,
            animationDuration: 0.1
        };

        if (flashEffect) this.client.world
            .getLocalSquare(squareX, squareY)
            ?.entity?.damageFlash();

        await this.setPosition(destination, moveOptions);
        await this.setPosition(origin, moveOptions);
    }

    async damageFlash() {
        const entityColour = new Color(this.colour);

        const flashOpacity = 0.4;
        const damagedColour = new Color([
            entityColour.red * flashOpacity + flashOpacity,
            entityColour.green * flashOpacity,
            entityColour.blue * flashOpacity
        ]).toNumber();

        this.sprite.tint = damagedColour;
        
        setTimeout(() => (
            animateAsync(this.client, Actions.tintTo(
                this.sprite,
                entityColour.toNumber(),
                0.5,
                Interpolations.pow2out
            ))
        ), 150);
    }

    setControllable(controllable: boolean) {
        if (!controllable) {
            this.sprite.removeAllListeners();

            if (this.dragListener) this.client.viewport.off(
                "pointermove", this.dragListener
            );

            this.sprite.cursor = "default";

            return;
        }

        this.sprite.cursor = "grab";

        const viewport = this.client.viewport;
        
        // When entity is held
        this.sprite.on("pointerdown", event => {
            this.held = true;

            this.sprite.position = viewport.toWorld(event.global);
            this.size = this.originalSize * 1.1;
            this.sprite.zIndex = Infinity;
            this.sprite.cursor = "grabbing";

            viewport.plugins.pause("drag");

            this.emit("hold");
        });

        // When entity is dragged around
        this.dragListener = event => {
            if (!this.held) return;

            const worldPosition = viewport.toWorld(event.global);

            this.sprite.position = worldPosition;
            this.emit("drag", worldPosition);
        };

        viewport.on("pointermove", this.dragListener);

        // When entity is dropped
        const dropEntity = () => {
            if (!this.held) return;

            this.held = false;
            this.size = this.originalSize;
            this.sprite.zIndex = Layer.ENTITIES;
            this.sprite.cursor = "grab";

            this.emit("drop", new Point(this.sprite.x, this.sprite.y));

            const fromSquare = this.position.clone();

            const toSquare = worldToSquarePosition(
                this.sprite.x, this.sprite.y
            );

            this.setPosition(toSquare);
            
            if (!fromSquare.equals(toSquare)) {
                this.emit("move", fromSquare, toSquare,
                    () => this.setPosition(fromSquare, { cancellation: true })
                );
            }

            viewport.plugins.resume("drag");
        };

        this.sprite.on("pointerup", dropEntity);
        this.sprite.on("pointerupoutside", dropEntity);
    }
}