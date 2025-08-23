import { Square } from "./Square";

export interface Chunk {
    squares: Square[][];
}

export function validateChunk(chunk: Chunk) {
    return chunk.squares.length == 8
        && chunk.squares.every(row => row.length == 8);
}