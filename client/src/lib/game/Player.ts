import { ColorSource, Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { random } from "es-toolkit";

import { pieceImages } from "@/constants/utils";
import { squareSize } from "@/constants/squares";

interface PlayerOptions {
    viewport: Viewport;
    x: number;
    y: number;
    colour?: ColorSource;
    controllable?: boolean;
}

export class Player {
    viewport: Viewport;
    sprite: Sprite;

    x: number;
    y: number;

    private held = false;

    constructor(opts: PlayerOptions) {
        this.viewport = opts.viewport;
        this.x = opts.x;
        this.y = opts.y;

        this.sprite = Sprite.from(pieceImages.wK);

        this.setSize(squareSize);
        this.sprite.anchor = 0.5;
        this.sprite.zIndex = 1;
        
        this.sprite.position.set(
            (opts.x * squareSize) + (squareSize / 2),
            (opts.y * squareSize) + (squareSize / 2)
        );

        this.sprite.tint = opts.colour || random(0, 0xffffff);

        if (opts.controllable) this.attachClientControl();
    }

    setSize(size: number) {
        this.sprite.width = this.sprite.height = size;
    }

    spawn() {
        this.viewport.addChild(this.sprite);
    }

    despawn() {
        this.viewport.removeChild(this.sprite);
    }

    attachClientControl() {
        this.sprite.eventMode = "static";

        this.sprite.on("pointerdown", event => {
            this.held = true;

            this.setSize(squareSize * 1.1);
            this.sprite.position = this.viewport.toWorld(event.global);

            this.viewport.plugins.pause("drag");
        });

        this.viewport.on("pointermove", event => {
            if (!this.held) return;

            this.sprite.position = this.viewport.toWorld(event.global);
        });

        const stopPlayerDrag = () => {
            this.held = false;

            this.setSize(squareSize);
            this.sprite.position.set(
                Math.floor(this.sprite.position.x / squareSize)
                    * squareSize + (squareSize / 2),
                Math.floor(this.sprite.position.y / squareSize)
                    * squareSize + (squareSize / 2)
            );

            this.viewport.plugins.resume("drag");
        };

        this.sprite.on("pointerup", stopPlayerDrag);
        this.sprite.on("pointerupoutside", stopPlayerDrag);
    }
}