import { Point, ColorSource, Sprite } from "pixi.js";

import { chunkSquareCount } from "shared/lib/world-chunks";
import { pieceImages } from "@/constants/utils";
import { InitialisedGameClient } from "../Client";
import { Entity } from "./Entity";
import { MoveHints } from "../utils/move-hints";

interface PlayerOptions {
    client: InitialisedGameClient;
    userId: string;
    position: Point;
    colour?: ColorSource;
    health: number;
    inventory?: string[]
    controllable?: boolean;
}

export class Player extends Entity {
    readonly userId: string;
    readonly moveHints: MoveHints;

    health: number;
    inventory: string[];

    constructor(opts: PlayerOptions) {
        super({ ...opts, sprite: Sprite.from(pieceImages.wK) });

        this.userId = opts.userId;
        this.health = opts.health;
        this.inventory = opts.inventory || [];

        this.moveHints = new MoveHints(
            this, this.getLegalMoves.bind(this)
        );

        this.on("hold", this.onHold);
        this.on("drop", this.onDrop);
    }

    private onHold() {
        this.moveHints.render();
    }

    private onDrop(from: Point, to: Point) {
        this.client.socket;
    }

    getLegalMoves() {
        const legalMoves: Point[] = [];

        const worldSquareSize = this.client.world.chunkSize
            ? this.client.world.chunkSize * chunkSquareCount
            : Infinity;

        const coords = {
            startX: Math.max(0, this.position.x - 1),
            startY: Math.max(0, this.position.y - 1),
            endX: Math.min(worldSquareSize - 1, this.position.x + 1),
            endY: Math.min(worldSquareSize - 1, this.position.y + 1)
        };

        for (let y = coords.startY; y <= coords.endY; y++) {
            for (let x = coords.startX; x <= coords.endX; x++) {
                if (x == this.position.x && y == this.position.y) continue;

                legalMoves.push(new Point(x, y));
            }
        }

        return legalMoves;
    }
}