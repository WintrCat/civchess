import { Point, ColorSource, Sprite } from "pixi.js";

import { pieceImages } from "@/constants/utils";
import { InitialisedGameClient } from "../Client";
import { Entity } from "./Entity";
import { MoveHints } from "../utils/move-hints";

interface PlayerOptions {
    client: InitialisedGameClient;
    x: number;
    y: number;
    colour?: ColorSource;
    controllable?: boolean;
}

export class Player extends Entity {
    private moveHints?: MoveHints;

    constructor(opts: PlayerOptions) {
        super({ ...opts, sprite: Sprite.from(pieceImages.wK) });

        this.on("hold", this.onHold);
        this.on("drop", this.onDrop);
    }

    private onHold() {
        if (this.moveHints?.visible)
            return this.moveHints.hide();

        this.moveHints = new MoveHints(
            this.client, this, this.getLegalMoves()
        );

        this.moveHints.show();
    }

    private onDrop(newX: number, newY: number) {
        
    }

    getLegalMoves() {
        const legalMoves: Point[] = [];

        const worldSquareSize = this.client.worldChunkSize
            ? this.client.worldChunkSize * 8 : Infinity;

        const coords = {
            startX: Math.max(0, this.x - 1),
            startY: Math.max(0, this.y - 1),
            endX: Math.min(worldSquareSize - 1, this.x + 1),
            endY: Math.min(worldSquareSize - 1, this.y + 1)
        };

        for (let y = coords.startY; y <= coords.endY; y++) {
            for (let x = coords.startX; x <= coords.endX; x++) {
                if (x == this.x && y == this.y) continue;

                legalMoves.push(new Point(x, y));
            }
        }

        return legalMoves;
    }
}