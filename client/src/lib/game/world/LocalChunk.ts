import { Container } from "pixi.js";

import { Chunk } from "shared/types/world/Chunk";
import { LocalSquare } from "./LocalSquare";
import { LocalWorld } from "./LocalWorld";
import { Layer } from "../constants/Layer";

export class LocalChunk implements Chunk {
    world: LocalWorld;
    squares: LocalSquare[][];

    private container = new Container({ zIndex: Layer.CHUNKS });

    constructor(
        world: LocalWorld,
        squares: LocalSquare[][]
    ) {
        this.world = world;
        this.squares = squares;

        this.container.addChild(
            ...squares.flat().map(square => square.graphics)
        );

        world.client.viewport?.addChild(this.container);
    }

    unload() {
        this.container.destroy();

        for (const square of this.squares.flat()) {
            square.entity?.despawn();
        }
    }
}