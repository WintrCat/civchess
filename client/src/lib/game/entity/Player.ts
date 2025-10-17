import { Point, ColorSource, Texture } from "pixi.js";

import { chunkSquareCount } from "shared/lib/world-chunks";
import { pieceImages } from "@/constants/utils";
import { MoveHints } from "../utils/move-hints";
import { clampViewportAroundSquare } from "../utils/viewport";
import { InitialisedGameClient } from "../Client";
import { Entity } from "./Entity";

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
        super({ ...opts, texture: Texture.from(pieceImages.wK) });

        this.userId = opts.userId;
        this.health = opts.health;
        this.inventory = opts.inventory || [];

        this.moveHints = new MoveHints(
            this, this.getLegalMoves.bind(this)
        );

        this.on("move", (from, to, cancel) => {
            if (!this.moveHints.squares.some(square => square.equals(to)))
                return cancel();

            this.client.socket.sendPacket("playerMove", {
                x: to.x,
                y: to.y
            });

            if (this.client.world.localPlayer?.userId == this.userId) {
                clampViewportAroundSquare(this.client, to.x, to.y);

                // Move the local player piece client side, doesn't necessarily need to be
                // after player move packet is sent and piece move packet is relayed
                // Delete runtime chunk entry for current pos and make one for new pos
                // Runtime chunks not connected to entity so don't worry

                // Unload chunks that you do not need.
                // Will need to diff chunks client side for this.
                // Technically you can just pick() the localChunks
            }
        });
    }

    getLegalMoves() {
        const legalMoves: Point[] = [];

        const worldSquareSize = this.client.world.chunkSize
            ? this.client.world.chunkSize * chunkSquareCount
            : Infinity;

        const bounds = {
            startX: Math.max(0, this.position.x - 1),
            startY: Math.max(0, this.position.y - 1),
            endX: Math.min(worldSquareSize - 1, this.position.x + 1),
            endY: Math.min(worldSquareSize - 1, this.position.y + 1)
        };

        for (let y = bounds.startY; y <= bounds.endY; y++) {
            for (let x = bounds.startX; x <= bounds.endX; x++) {
                if (x == this.position.x && y == this.position.y) continue;

                legalMoves.push(new Point(x, y));
            }
        }

        return legalMoves;
    }
}