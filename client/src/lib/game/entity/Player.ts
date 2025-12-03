import {
    Point,
    Texture,
    Graphics,
    GraphicsOptions,
    TickerCallback
} from "pixi.js";
import { clamp, difference } from "es-toolkit";

import { getSurroundingPoints } from "shared/lib/surrounding-positions";
import { coordinateIndex, getChunkCoordinates } from "shared/lib/world-chunks";
import { getLegalKingMoves } from "shared/lib/legal-moves";
import { pieceImages } from "@/constants/utils";
import { halfSquare, squareSize } from "../constants/squares";
import { Layer } from "../constants/Layer";
import { attackSound, playMoveSound } from "../constants/move-sounds";
import { MoveHints } from "../utils/move-hints";
import { clampViewportAroundSquare, isVisibleInViewport } from "../utils/viewport";
import { Entity, EntityEvents, SubEntityOptions } from "./Entity";

interface PlayerOptions extends SubEntityOptions {
    userId: string;
}

interface MoveCooldown {
    beginsAt?: number;
    expiresAt?: number;
    graphics?: Graphics;
}

const hologramOptions: GraphicsOptions = {
    zIndex: Layer.HOLOGRAMS,
    eventMode: "none"
};

export class Player extends Entity {
    userId: string;

    moveHints: MoveHints;
    moveCooldown: MoveCooldown = {};
    private marker?: Graphics;

    private ticker?: TickerCallback<any>;

    constructor(opts: PlayerOptions) {
        super({ ...opts, texture: Texture.from(pieceImages.wK) });

        this.userId = opts.userId;

        this.moveHints = new MoveHints(
            this, this.getLegalMoves.bind(this)
        );

        this.on("move", this.onEntityMove);

        if (!this.client.world.isLocalPlayer(this)) return;

        // Add move cooldown graphics
        this.moveCooldown = { graphics: new Graphics(hologramOptions) };

        const mc = this.moveCooldown;
        this.client.viewport.addChild(mc.graphics!);

        // Add marker
        this.marker = new Graphics(hologramOptions);
        this.client.viewport.addChild(this.marker);

        this.ticker = tick => {
            this.renderMarker(tick.lastTime);

            // Redraw move cooldown bar
            mc.graphics?.clear();

            if (!mc.beginsAt || !mc.expiresAt) return;
            if (Date.now() >= mc.expiresAt) return;

            const remainingPercent = Math.abs(mc.expiresAt - Date.now())
                / Math.abs(mc.expiresAt - mc.beginsAt);

            mc.graphics?.rect(
                (this.sprite.x - halfSquare) - (squareSize / 16),
                this.sprite.y - halfSquare - (squareSize / 4),
                remainingPercent * (squareSize + squareSize / 8),
                squareSize / 10
            ).fill("#ff2d2d8f");
        };

        this.client.app.ticker.add(this.ticker);
    }

    despawn() {
        super.despawn();

        this.moveCooldown.graphics?.destroy();
        this.marker?.destroy();
        
        if (this.ticker)
            this.client.app.ticker.remove(this.ticker);
    }

    renderMarker(currentTick: number, padding = 10) {
        if (!this.marker) return;

        const vp = this.client.viewport;
        const spriteVisible = isVisibleInViewport(vp, this.sprite);

        const yOffset = spriteVisible
            ? Math.sin(currentTick / 1000 * 2) * (squareSize / 16)
            : 0;

        const size = squareSize / 3;

        this.marker.clear()
            .poly([
                { x: -(size / 3), y: -size },
                { x: size / 3, y: -size },
                { x: 0, y: 0 }
            ])
            .fill("#ff2d2d")
            .stroke({
                width: 2,
                color: "#c52222",
                join: "round"
            });

        const x = clamp(
            this.sprite.x,
            vp.left + padding,
            vp.right - padding
        );

        const topMarkerSpace = this.sprite.getBounds().minY >= halfSquare;

        const y = clamp(
            this.sprite.y + yOffset + (spriteVisible
                ? (topMarkerSpace ? -halfSquare : halfSquare) : 0
            ),
            vp.top + padding,
            vp.bottom - padding
        );

        this.marker.position.set(x, y);

        this.marker.rotation = Math.atan2(
            this.sprite.y - y,
            this.sprite.x - x
        ) - (90 * (Math.PI / 180));
    }

    getLegalMoves() {
        const { x, y } = this.position;

        return getLegalKingMoves(x, y, this.client.world.chunkSize)
            .values()
            .map(({ x, y }) => new Point(x, y));
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
            const fromSquare = this.client.world
                .getLocalSquare(from.x, from.y);
            if (!fromSquare) return;

            const toSquare = this.client.world
                .getLocalSquare(to.x, to.y);
            if (!toSquare) return;

            if (response.cooldownExpiresAt) {
                this.moveCooldown.beginsAt = Date.now();
                this.moveCooldown.expiresAt = response.cooldownExpiresAt;
            }

            if (response.attack) {
                attackSound.play();
                toSquare.entity?.damageFlash();
            }

            if (response.cancelled) return cancel();

            clampViewportAroundSquare(this.client, to.x, to.y);
            playMoveSound(toSquare);

            fromSquare.moveEntity(toSquare);

            // Unload chunks that are no longer in render distance
            const { chunkX, chunkY } = getChunkCoordinates(to.x, to.y);

            const requiredChunks = getSurroundingPoints({
                originX: chunkX,
                originY: chunkY,
                radius: this.client.world.renderDistance,
                max: this.client.world.chunkSize,
                includeCenter: true
            }).map(pos => coordinateIndex(pos.x, pos.y)).toArray();

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
}