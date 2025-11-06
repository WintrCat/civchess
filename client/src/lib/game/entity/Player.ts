import { Point, ColorSource, Texture, Graphics } from "pixi.js";
import { difference } from "es-toolkit";

import {
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingPositions
} from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { pieceImages } from "@/constants/utils";
import { renderDistance, squareSize } from "../constants/squares";
import { Layer } from "../constants/Layer";
import { MoveHints } from "../utils/move-hints";
import { clampViewportAroundSquare } from "../utils/viewport";
import { InitialisedGameClient } from "../Client";
import { Entity, EntityEvents, SubEntityOptions } from "./Entity";

interface PlayerOptions extends SubEntityOptions {
    client: InitialisedGameClient;
    userId: string;
    position: Point;
    colour?: ColorSource;
    controllable?: boolean;
}

interface MoveCooldown {
    beginsAt?: number;
    expiresAt?: number;
    graphics: Graphics;
}

export class Player extends Entity {
    userId: string;

    moveHints: MoveHints;

    moveCooldown: MoveCooldown = {
        graphics: new Graphics({
            zIndex: Layer.HOLOGRAMS,
            eventMode: "none"
        })
    };

    private ticker: () => void;

    constructor(opts: PlayerOptions) {
        super({ ...opts, texture: Texture.from(pieceImages.wK) });

        this.userId = opts.userId;

        this.moveHints = new MoveHints(
            this, this.getLegalMoves.bind(this)
        );

        this.on("move", this.onEntityMove);

        const mc = this.moveCooldown;
        this.client.viewport.addChild(mc.graphics);

        this.ticker = () => {
            // Draw cooldown bar if bounds are set
            mc.graphics.clear();

            if (!mc.beginsAt || !mc.expiresAt) return;
            if (Date.now() >= mc.expiresAt) return;

            const remainingPercent = Math.abs(mc.expiresAt - Date.now())
                / Math.abs(mc.expiresAt - mc.beginsAt);

            mc.graphics.rect(
                (this.sprite.x - (squareSize / 2)) - (squareSize / 16),
                this.sprite.y - (squareSize / 2) - (squareSize / 4),
                remainingPercent * (squareSize + squareSize / 8),
                squareSize / 10
            ).fill("#ff2d2d8f");
        };

        this.client.app.ticker.add(this.ticker);
    }

    private onEntityMove: EntityEvents["move"] = (from, to, cancel) => {
        if (!this.moveHints.squares.some(square => square.equals(to)))
            return cancel();

        if (Date.now() < (this.moveCooldown.expiresAt || 0))
            return cancel();

        if (this.client.world.localPlayer != this) return;

        this.client.socket.sendPacket("playerMove", {
            x: to.x,
            y: to.y
        }, response => {
            if (response.cooldownExpiresAt) {
                this.moveCooldown.beginsAt = Date.now();
                this.moveCooldown.expiresAt = response.cooldownExpiresAt;
            }

            if (!response.success) return cancel();

            clampViewportAroundSquare(this.client, to.x, to.y);

            // Move entity to new local square
            const fromSquare = this.client.world
                .getLocalSquare(from.x, from.y);

            const toSquare = this.client.world.getLocalSquare(to.x, to.y);

            if (toSquare) fromSquare?.moveEntity(toSquare);

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
        });
    }

    despawn() {
        super.despawn();

        this.moveCooldown.graphics.destroy();
        this.client.app.ticker.remove(this.ticker);
    }

    getLegalMoves() {
        const { x, y } = this.position;

        return getLegalKingMoves(x, y, this.client.world.chunkSize)
            .values()
            .map(({ x, y }) => new Point(x, y));
    }
}