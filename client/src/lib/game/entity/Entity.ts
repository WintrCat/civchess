import {
    FederatedPointerEvent,
    ColorSource,
    Point,
    Sprite,
    Texture
} from "pixi.js";

import { squareSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { TypedEmitter } from "../utils/event-emitter";
import {
    squareToWorldPosition,
    worldToSquarePosition
} from "../utils/world-position";

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
            zIndex: 1,
            position: squareToWorldPosition(this.position),
            width: this.originalSize,
            height: this.originalSize,
            tint: opts.colour || "#ffffff",
            eventMode: "static"
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

    setPosition(point: Point, cancellation = false) {
        this.position = point;
        this.sprite.position = squareToWorldPosition(point.x, point.y);

        if (cancellation) {
            // PLAY A CANCELLATION SOUND OR SOMETHING
            console.log("position set for a move cancellation!");
        }
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

            return;
        }

        const viewport = this.client.viewport;
        
        // When entity is held
        this.sprite.on("pointerdown", event => {
            this.held = true;
            this.sprite.position = viewport.toWorld(event.global);
            this.setSize(this.originalSize * 1.1);

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

            this.emit("drop", new Point(this.sprite.x, this.sprite.y));

            const fromSquare = this.position.clone();

            const toSquare = worldToSquarePosition(
                this.sprite.x, this.sprite.y
            );

            this.setPosition(toSquare);
            
            if (!fromSquare.equals(toSquare)) {
                this.emit("move", fromSquare, toSquare,
                    () => this.setPosition(fromSquare, true)
                );
            }

            viewport.plugins.resume("drag");
        };

        this.sprite.on("pointerup", dropEntity);
        this.sprite.on("pointerupoutside", dropEntity);
    }
}