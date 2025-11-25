import {
    FederatedPointerEvent,
    ColorSource,
    Point,
    Sprite,
    Texture,
    Color
} from "pixi.js";
import { Action, Actions, Interpolations } from "pixi-actions";

import { InitialisedGameClient } from "../Client";
import { TypedEmitter } from "../utils/event-emitter";
import {
    squareToWorldPosition,
    worldToSquarePosition
} from "../utils/world-position";
import { animateAsync } from "../utils/animations";
import { squareSize } from "../constants/squares";
import { Layer } from "../constants/Layer";

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
    controllable?: boolean;
}

export type SubEntityOptions = Omit<EntityOptions, "texture">;

interface EntityMoveOptions {
    cancellation?: boolean;
    animate?: boolean;
    animationDuration?: number;
    visualOnly?: boolean;
}

export class Entity extends TypedEmitter<EntityEvents> {
    client: InitialisedGameClient;
    sprite: Sprite;

    position: Point;

    private readonly originalSize: number;
    private held = false;

    private dragListener?: (event: FederatedPointerEvent) => void;

    constructor(opts: EntityOptions) {
        super();

        this.client = opts.client;
        this.position = opts.position;
        this.originalSize = opts.size || squareSize;

        this.sprite = new Sprite({
            texture: opts.texture,
            anchor: 0.5,
            zIndex: Layer.ENTITIES,
            position: squareToWorldPosition(this.position),
            width: this.originalSize,
            height: this.originalSize,
            tint: opts.colour || "#ffffff",
            eventMode: "dynamic"
        });

        this.setControllable(opts.controllable || false);
    }

    private setSize(size: number) {
        this.sprite.width = this.sprite.height = size;
    }

    get x() {
        return this.position.x;
    }

    get y() {
        return this.position.y;
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
            await animateAsync(this.client, Actions.moveTo(
                this.sprite,
                worldPos.x,
                worldPos.y,
                opts.animationDuration || 0.06,
                Interpolations.linear
            ));
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

        if (flashEffect) {
            const destinationSprite = this.client.world
                .getLocalSquare(squareX, squareY)?.entity?.sprite;
            if (!destinationSprite) return;

            const entityColour = new Color(destinationSprite.tint);

            const flashOpacity = 0.4;
            const damagedColour = new Color([
                entityColour.red * flashOpacity + flashOpacity,
                entityColour.green * flashOpacity,
                entityColour.blue * flashOpacity
            ]).toNumber();

            destinationSprite.tint = damagedColour;

            new Audio("/audio/attack.mp3").play();
            
            setTimeout(() => (
                animateAsync(this.client, Actions.tintTo(
                    destinationSprite,
                    entityColour.toNumber(),
                    0.5,
                    Interpolations.pow2out
                ))
            ), 150);
        }

        await this.setPosition(destination, moveOptions);
        await this.setPosition(origin, moveOptions);
    }

    setColour(newColour: ColorSource) {
        this.sprite.tint = newColour;
    }

    spawn() {
        this.client.viewport.addChild(this.sprite);
        
        return this;
    }

    despawn() {
        if (this.dragListener) this.client.viewport.off(
            "pointermove", this.dragListener
        );

        this.sprite.destroy();
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
            this.setSize(this.originalSize * 1.1);
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
            this.setSize(this.originalSize);
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