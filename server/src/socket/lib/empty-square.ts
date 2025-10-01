import { omit } from "es-toolkit";

import { Chunk } from "shared/types/world/Chunk";
import { chunkSquareCount, getChunkCoordinates } from "shared/lib/world-chunks";
import { getChunk } from "./world-chunks";

interface SearchNode {
    x: number;
    y: number;
    nextDistance: number;
}

export async function findNearestEmptySquare(
    worldCode: string,
    originX: number,
    originY: number,
    distanceCoefficient = 2
) {
    const frontier: SearchNode[] = [
        { x: originX, y: originY, nextDistance: 1 }
    ];

    const chunkCache: Chunk[][] = [];

    while (frontier.length > 0) {
        const node = frontier.pop();
        if (!node) continue;

        // Get square of node, using chunk cache if possible
        const { x: chunkX, y: chunkY } = getChunkCoordinates(node.x, node.y);

        let nodeChunk = chunkCache.at(chunkY)?.at(chunkX);

        if (!nodeChunk) {
            const fetchedChunk = await getChunk(worldCode, chunkX, chunkY);
            if (!fetchedChunk) continue;

            chunkCache[chunkY] ??= [];
            nodeChunk = chunkCache[chunkY][chunkX] = fetchedChunk;
        }

        const nodeSquare = nodeChunk.squares
            .at(node.y % chunkSquareCount)
            ?.at(node.x % chunkSquareCount);
        if (!nodeSquare) continue;

        // If node square is empty, return it
        if (!nodeSquare.piece)
            return omit({ ...node, square: nodeSquare }, ["nextDistance"]);

        // Add adjacent squares to search; increase distance exponentially
        for (let yDir = -1; yDir <= 1; yDir++) {
            for (let xDir = -1; xDir <= 1; xDir++) {
                if (xDir == 0 && yDir == 0) continue;

                frontier.push({
                    x: node.x + (xDir * node.nextDistance),
                    y: node.y + (yDir * node.nextDistance),
                    nextDistance: node.nextDistance * distanceCoefficient
                });
            }
        }
    }

    return null;
}