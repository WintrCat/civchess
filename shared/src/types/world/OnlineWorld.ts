import { World } from "./World";
import { Piece } from "./Piece";

export function coordinateIndex(chunkX: number, chunkY: number) {
    return `${chunkX},${chunkY}`;
}

// Coordinate Index -> Piece
export type RuntimeChunk = Record<string, Piece>;

// Coordinate Index -> Chunk
export interface OnlineWorld extends World {
    runtimeChunks: Record<string, RuntimeChunk>;
}