import { Point, ColorSource, Texture, Graphics } from "pixi.js";
import { difference } from "es-toolkit";

import {
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingPositions
} from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { pieceImages } from "@/constants/utils";
import { renderDistance, squareSize } from "@/constants/squares";
import { Layer } from "../constants/Layer";
import { MoveHints } from "../utils/move-hints";
import { clampViewportAroundSquare } from "../utils/viewport";
import { InitialisedGameClient } from "../Client";
import { Entity, EntityEvents } from "./Entity";

interface PlayerOptions {
    client: InitialisedGameClient;
    userId: string;
    position: Point;
    colour?: ColorSource;
    health: number;
    inventory?: string[]
    controllable?: boolean;
}

interface MoveCooldown {
    beginsAt?: number;
    expiresAt?: number;
    graphics: Graphics;
}

export class Player extends Entity {
    readonly userId: string;
    readonly moveHints: MoveHints;

    ticker: () => void;

    health: number;
    inventory: string[];

    moveCooldown: MoveCooldown = {
        graphics: new Graphics({
            zIndex: Layer.HOLOGRAMS,
            eventMode: "none"
        })
    };

    constructor(opts: PlayerOptions) {
        super({ ...opts, texture: Texture.from(pieceImages.wK) });

        this.userId = opts.userId;
        this.health = opts.health;
        this.inventory = opts.inventory || [];

        this.moveHints = new MoveHints(
            this, this.getLegalMoves.bind(this)
        );

        this.on("move", this.onEntityMove);

        const mc = this.moveCooldown;

        this.client.viewport.addChild(mc.graphics);

        this.ticker = () => {
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

        this.client.socket.sendPacket("playerMove", {
            x: to.x,
            y: to.y
        }, response => {
            if (!response.success) return cancel();

            if (this.client.world.localPlayer?.userId != this.userId)
                return;

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

            // Load cooldown into player entity
            this.moveCooldown.beginsAt = Date.now();
            this.moveCooldown.expiresAt = response.cooldownExpiresAt || 0;
        });
    }

    getLegalMoves() {
        const { x, y } = this.position;

        return getLegalKingMoves(x, y, this.client.world.chunkSize)
            .values()
            .map(({ x, y }) => new Point(x, y));
    }

    despawn() {
        super.despawn();

        this.moveCooldown.graphics.destroy();
        this.client.app.ticker.remove(this.ticker);
    }
}