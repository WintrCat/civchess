import { sample } from "es-toolkit";

import { SquareType } from "shared/constants/SquareType";
import { World, WorldOptions } from "shared/types/world/World";
import { Chunk } from "shared/types/world/Chunk";
import { Square } from "shared/types/world/Square";
import { chunkSquareCount } from "shared/lib/world-chunks";

export function generateWorld(options: WorldOptions): World {
    const chunks: Chunk[][] = [];

    for (let y = 0; y < 8; y++) {
        const row: Chunk[] = [];

        for (let x = 0; x < 8; x++) {
            row.push(generateChunk(options, x, y));
        }
        
        chunks.push(row);
    }

    return {
        name: options.name,
        code: options.code,
        pinned: options.pinned || false,
        chunks: chunks,
        players: {},
        createdAt: new Date().toISOString(),
        bannedPlayers: {},
        operatorPlayers: {}
    };
}

export function generateChunk(
    options: WorldOptions,
    chunkX: number,
    chunkY: number
): Chunk {
    const squares: Square[][] = [];

    for (let y = 0; y < chunkSquareCount; y++) {
        const row: Square[] = [];

        for (let x = 0; x < chunkSquareCount; x++) {
            row.push({
                type: sample(options.squareTypes || Object.values(SquareType))
            });
        }
        
        squares.push(row);
    }

    return { squares };
}