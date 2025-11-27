import { Graphics, TickerCallback } from "pixi.js";

import { Piece } from "shared/types/world/Piece";
import { SquareType } from "shared/constants/SquareType";
import { squareColours, squareSize } from "../constants/squares";
import { InitialisedGameClient } from "../Client";
import { Entity } from "../entity/Entity";
import { setBrightness } from "../utils/animations";

export class LocalSquare {
    client: InitialisedGameClient;
    graphics: Graphics;

    readonly x: number;
    readonly y: number;
    readonly shade: "light" | "dark";

    entity?: Entity;

    private highlightTicker?: TickerCallback<any>;

    constructor(
        client: InitialisedGameClient,
        x: number,
        y: number,
        type: SquareType,
        entity?: Entity
    ) {
        this.client = client;

        this.x = x;
        this.y = y;
        this.shade = (x + y) % 2 == 0 ? "light" : "dark";
    
        const graphics = new Graphics().rect(
            x * squareSize, y * squareSize,
            squareSize, squareSize
        );
        graphics.cullable = true;
    
        client.viewport.addChild(graphics);

        this.graphics = graphics;
        this.setType(type);

        this.setEntity(entity);
    }

    setType(type: SquareType) {
        this.graphics.fill(squareColours[type][this.shade]);
    }

    setEntity(entity: Entity | undefined) {
        this.entity?.despawn();
        this.entity = entity;

        this.setHighlighted(
            !!entity
            && this.client.world.isLocalPlayer(entity)
        );
    }

    setPiece(piece: Piece | undefined) {
        if (!piece) return this.setEntity(undefined);

        this.setEntity(this.client.world
            .pieceToEntity(this.x, this.y, piece)
            .spawn()
        );
    }

    moveEntity(toSquare: LocalSquare) {
        if (!this.entity) return;

        toSquare.setEntity(this.entity);
        this.entity = undefined;
        this.setHighlighted(false);
    }

    setHighlighted(highlighted: boolean) {
        if (highlighted) {
            this.highlightTicker = tick => setBrightness(
                this.graphics,
                Math.sin(tick.lastTime / 1000 * 2) / 16 + (17 / 16)
            );

            this.client.app.ticker.add(this.highlightTicker);

            return;
        }

        setBrightness(this.graphics, null);

        if (!this.highlightTicker) return;
        this.client.app.ticker.remove(this.highlightTicker);
    }
}