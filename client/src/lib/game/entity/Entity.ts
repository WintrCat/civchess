import { ColorSource, Point, Sprite } from "pixi.js";

import { squareSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { TypedEmitter } from "../utils/event-emitter";
import { toWorldPosition } from "../utils/square-position";

export type EntityEvents = {
    hold: () => void;
    drag: (point: Point) => void;
    drop: (newX: number, newY: number) => void;
};

interface EntityOptions {
    client: InitialisedGameClient;
    sprite: Sprite;
    x: number;
    y: number;
    size?: number;
    colour?: ColorSource;
    controllable?: boolean;
}

export class Entity extends TypedEmitter<EntityEvents> {
    client: InitialisedGameClient;
    sprite: Sprite;

    x: number;
    y: number;
    colour?: ColorSource;

    private originalSize: number;
    private held = false;

    constructor(opts: EntityOptions) {
        super();

        // References
        this.client = opts.client;
        this.sprite = opts.sprite;

        // Configure Sprite
        this.sprite.eventMode = "static";
        this.sprite.anchor = 0.5;
        this.sprite.zIndex = 1;

        this.x = opts.x;
        this.y = opts.y;
        this.setPosition(opts.x, opts.y);

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
        this.client.viewport.removeChild(this.sprite);
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
        
        this.sprite.position.copyFrom(
            toWorldPosition(x, y)
        );
    }

    setControllable(controllable: boolean) {
        if (!controllable) {
            this.sprite.removeAllListeners();
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

        this.sprite.on("pointermove", event => {
            if (!this.held) return;

            const worldPosition = viewport.toWorld(event.global);

            this.sprite.position = worldPosition;
            this.emit("drag", worldPosition);
        });

        const dropEntity = () => {
            this.held = false;

            this.setSize(this.originalSize);

            const newX = Math.floor(this.sprite.position.x / squareSize);
            const newY = Math.floor(this.sprite.position.y / squareSize);

            if (this.x != newX || this.y != newY)
                this.emit("drop", newX, newY);

            this.setPosition(newX, newY);

            viewport.plugins.resume("drag");
        };

        this.sprite.on("pointerup", dropEntity);
        this.sprite.on("pointerupoutside", dropEntity);
    }
}