import { Graphics } from "pixi.js";

import { Piece } from "shared/types/world/Piece";
import { SquareType } from "shared/constants/SquareType";
import { squareColours, squareSize } from "../constants/squares";
import { InitialisedGameClient } from "../Client";
import { Entity } from "../entity/Entity";

export class LocalSquare {
    client: InitialisedGameClient;
    graphics: Graphics;

    readonly x: number;
    readonly y: number;
    readonly shade: "light" | "dark";

    entity?: Entity;

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

        this.entity = entity;
    
        const graphics = new Graphics().rect(
            x * squareSize, y * squareSize,
            squareSize, squareSize
        )
        graphics.cullable = true;
    
        client.viewport.addChild(graphics);

        this.graphics = graphics;
        this.setType(type);
    }

    setType(type: SquareType) {
        this.graphics.fill(squareColours[type][this.shade]);
    }

    setEntity(entity: Entity | undefined) {
        this.entity?.despawn();
        this.entity = entity;
    }

    setPiece(piece: Piece) {
        this.setEntity(this.client.world
            .pieceToEntity(this.x, this.y, piece)
            .spawn()
        );
    }

    moveEntity(toSquare: LocalSquare) {
        if (!this.entity) return;

        toSquare.setEntity(this.entity);
        this.entity = undefined;
    }
}