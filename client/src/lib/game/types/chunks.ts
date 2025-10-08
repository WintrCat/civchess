import { Chunk } from "shared/types/world/Chunk";

import { Entity } from "../entity/Entity";
import { Square } from "shared/types/world/Square";

export type LocalSquare = Omit<Square, "piece"> & { piece?: Entity };

export type LocalChunk = Omit<Chunk, "squares"> & {
    squares: LocalSquare[][];
    runtimeSquares: Record<string, Entity>;
};