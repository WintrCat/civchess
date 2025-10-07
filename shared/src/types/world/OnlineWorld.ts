import { World } from "./World";
import { Piece } from "./Piece";

// Coordinate Index -> Piece
export type RuntimeChunk = Record<string, Piece>;

// Coordinate Index -> Chunk
export interface OnlineWorld extends World {
    runtimeChunks: Record<string, RuntimeChunk>;
}

export function coordinateIndex(index: string): { x: number, y: number };
export function coordinateIndex(x: number, y: number): string;

export function coordinateIndex(x: number | string, y?: number) {
    if (typeof x == "string") {
        const parts = x.split(",");
        return { x: Number(parts[0]), y: Number(parts[1]) };
    } else {
        return `${x},${y}`;
    }
}