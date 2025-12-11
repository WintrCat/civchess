import { omit } from "es-toolkit";

import { Chunk } from "shared/types/world/Chunk";
import { RuntimeChunk } from "shared/types/world/OnlineWorld";
import {
    chunkSquareCount,
    coordinateIndex,
    getChunkCoordinates
} from "shared/lib/world-chunks";
import { getChunk, getRuntimeChunk } from "./chunks";

interface ChunkCache {
    persistent: Chunk;
    runtime: RuntimeChunk;
}

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

    const chunkCache: ChunkCache[][] = [];

    while (frontier.length > 0) {
        const node = frontier.pop();
        if (!node) continue;

        // Get square of node, using chunk cache if possible
        const { chunkX, chunkY, relativeX, relativeY } = (
            getChunkCoordinates(node.x, node.y)
        );

        let nodeChunk = chunkCache.at(chunkY)?.at(chunkX);

        if (!nodeChunk) {
            const fetchedChunk = await getChunk(worldCode, chunkX, chunkY);
            const fetchedRuntimeChunk = await getRuntimeChunk(
                worldCode, chunkX, chunkY
            );
            
            if (!fetchedChunk || !fetchedRuntimeChunk) continue;

            chunkCache[chunkY] ??= [];
            chunkCache[chunkY][chunkX] = {
                persistent: fetchedChunk,
                runtime: fetchedRuntimeChunk
            };

            nodeChunk = chunkCache[chunkY][chunkX];
        }

        const nodeSquare = nodeChunk.persistent.squares
            .at(relativeY)
            ?.at(relativeX);
        if (!nodeSquare) continue;

        const nodeRuntimeSquare = nodeChunk.runtime[
            coordinateIndex(relativeX, relativeY)
        ];

        // If node square is empty, return it
        if (!nodeSquare.piece && !nodeRuntimeSquare)
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