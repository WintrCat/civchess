import { sample } from "es-toolkit";

import { SquareType } from "shared/constants/SquareType";
import { Chunk } from "shared/types/Chunk";
import { Square } from "shared/types/Square";
import { World, WorldOptions } from "shared/types/World";

export function generateWorld(options: WorldOptions): World {
    const chunks: Chunk[][] = [];

    for (let y = 0; y < 12; y++) {
        const row: Chunk[] = [];

        for (let x = 0; x < 12; x++) {
            row.push(generateChunk(options, x, y));
        }
        
        chunks.push(row);
    }

    return {
        name: options.name,
        code: options.code,
        pinned: options.pinned || false,
        chunks: chunks,
        createdAt: new Date().toISOString()
    };
}

export function generateChunk(
    options: WorldOptions,
    chunkX: number,
    chunkY: number
): Chunk {
    const squares: Square[][] = [];

    for (let y = 0; y < 8; y++) {
        const row: Square[] = [];

        for (let x = 0; x < 8; x++) {
            row.push({
                type: sample(options.squareTypes || Object.values(SquareType))
            });
        }
        
        squares.push(row);
    }

    return { squares };
}