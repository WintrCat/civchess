import { Graphics } from "pixi.js";

import { Chunk } from "shared/types/world/Chunk";
import { SquareType } from "shared/constants/SquareType";
import { Updates } from "shared/types/packets/clientbound/WorldChunkUpdatePacket";
import { squareColours, squareSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { Entity } from "../entity/Entity";
import { Square } from "shared/types/world/Square";

export type LocalChunk = Omit<Chunk, "squares"> & {
    squares: LocalSquare[][];
};

export class LocalSquare {
    client: InitialisedGameClient;
    graphics: Graphics;

    readonly x: number;
    readonly y: number;
    readonly shade: "light" | "dark";

    set type(type: SquareType) {
        this.graphics.fill(squareColours[type][this.shade]);
    }

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
        this.type = type;
    }

    update(update: Updates<Square>) {
        if (update.type) this.type = update.type;
        
        if (update.piece !== undefined) {
            this.entity?.despawn();

            this.entity = update.piece
                ? this.client.world
                    .pieceToEntity(this.x, this.y, update.piece)
                    .spawn()
                : undefined;
        }
    }
}