import { World } from "./World";
import { Piece } from "./Piece";

export type ChunkLayer = "persistent" | "runtime";

// Coordinate Index -> Piece
export type RuntimeChunk = Record<string, Piece>;

// Coordinate Index -> Chunk
export interface OnlineWorld extends World {
    runtimeChunks: Record<string, RuntimeChunk>;
}