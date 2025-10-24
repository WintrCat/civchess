import { Point, ColorSource, Texture } from "pixi.js";
import { difference } from "es-toolkit";

import {
    chunkSquareCount,
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingPositions
} from "shared/lib/world-chunks";
import { pieceImages } from "@/constants/utils";
import { renderDistance } from "@/constants/squares";
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

                // Move entity to new local square
                const fromSquare = this.client.world
                    .getLocalSquare(from.x, from.y);

                const toSquare = this.client.world.getLocalSquare(to.x, to.y);

                if (toSquare) {
                    this.client.world
                        .getLocalSquare(from.x, from.y)
                        ?.moveEntity(toSquare);
                } else {
                    fromSquare?.update({ piece: null });
                }

                // Unload chunks that are no longer in render distance
                const { chunkX, chunkY } = getChunkCoordinates(to.x, to.y);

                const requiredChunks = getSurroundingPositions(
                    chunkX, chunkY, {
                        radius: renderDistance,
                        max: this.client.world.chunkSize,
                        includeCenter: true
                    }
                ).map(pos => coordinateIndex(pos.x, pos.y)).toArray();

                const unneededChunks = difference(
                    Object.keys(this.client.world.localChunks),
                    requiredChunks
                );

                for (const coordIndex of unneededChunks) {
                    const { x, y } = coordinateIndex(coordIndex);
                    this.client.world.setLocalChunk(x, y, undefined);
                }
            }
        });
    }

    getLegalMoves() {
        const { x, y } = this.position;

        return getSurroundingPositions(x, y, {
            max: this.client.world.chunkSize
                ? this.client.world.chunkSize * chunkSquareCount
                : Infinity
        }).map(({ x, y }) => new Point(x, y));
    }
}