import { FederatedPointerEvent, ColorSource, Point, Sprite } from "pixi.js";

import { squareSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { TypedEmitter } from "../utils/event-emitter";
import { squareWorldPosition } from "../utils/world-position";

export type EntityEvents = {
    hold: () => void;
    drag: (point: Point) => void;
    drop: (from: Point, to: Point, cancel?: () => void) => void;
};

interface EntityOptions {
    client: InitialisedGameClient;
    sprite: Sprite;
    position: Point;
    size?: number;
    colour?: ColorSource;
    controllable?: boolean;
}

export class Entity extends TypedEmitter<EntityEvents> {
    client: InitialisedGameClient;
    sprite: Sprite;

    position: Point;
    colour?: ColorSource;

    private originalSize: number;
    private held = false;

    private dragListener?: (event: FederatedPointerEvent) => void;

    constructor(opts: EntityOptions) {
        super();

        // References
        this.client = opts.client;
        this.sprite = opts.sprite;

        // Configure Sprite
        this.sprite.eventMode = "static";
        this.sprite.anchor = 0.5;
        this.sprite.zIndex = 1;

        this.position = opts.position;
        this.setPosition(opts.position.x, opts.position.y);

        this.originalSize = opts.size || squareSize;
        this.setSize(this.originalSize);

        this.sprite.tint = opts.colour || 0xffffff;

        // Attach client control if necessary
        this.setControllable(opts.controllable || false);
    }

    private setSize(size: number) {
        this.sprite.width = this.sprite.height = size;
    }

    spawn() {
        this.client.viewport.addChild(this.sprite);
    }

    despawn() {
        if (this.dragListener) this.client.viewport.off(
            "pointermove", this.dragListener
        );

        this.client.viewport.removeChild(this.sprite);
    }

    setPosition(x: number, y: number) {
        this.position = new Point(x, y);
        
        this.sprite.position.copyFrom(
            squareWorldPosition(x, y)
        );
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
        
        this.sprite.on("pointerdown", event => {
            this.held = true;

            this.setSize(this.originalSize * 1.1);
            this.sprite.position = viewport.toWorld(event.global);

            this.client.viewport.plugins.pause("drag");

            this.emit("hold");
        });

        this.dragListener = event => {
            if (!this.held) return;

            const worldPosition = viewport.toWorld(event.global);

            this.sprite.position = worldPosition;
            this.emit("drag", worldPosition);
        };

        this.client.viewport.on("pointermove", this.dragListener);

        const dropEntity = () => {
            this.held = false;

            this.setSize(this.originalSize);

            const newX = Math.floor(this.sprite.position.x / squareSize);
            const newY = Math.floor(this.sprite.position.y / squareSize);

            let cancelled = false;

            if (this.position.x != newX || this.position.y != newY) {
                this.emit("drop",
                    new Point(this.position.x, this.position.y),
                    new Point(newX, newY),
                    () => cancelled = true
                );
            }

            if (cancelled) {
                this.setPosition(this.position.x, this.position.y);
            } else {
                this.setPosition(newX, newY);
            }

            viewport.plugins.resume("drag");
        };

        this.sprite.on("pointerup", dropEntity);
        this.sprite.on("pointerupoutside", dropEntity);
    }
}