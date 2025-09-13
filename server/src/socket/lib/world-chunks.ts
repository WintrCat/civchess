import { Chunk } from "shared/types/world/Chunk";
import { getRedisClient } from "@/database/redis";

const defaultRenderDistance = 1;

export function getChunkCoordinates(squareX: number, squareY: number) {
    return {
        x: Math.floor(squareX / 8),
        y: Math.floor(squareY / 8)
    }
}

export async function* getSurroundingChunks(
    worldCode: string,
    originSquareX: number,
    originSquareY: number,
    renderDistance = defaultRenderDistance
) {
    const worldSize = await getRedisClient().json
        .length(worldCode, "$.chunks");

    const { x: originX, y: originY } = getChunkCoordinates(
        originSquareX, originSquareY
    );

    const coords = {
        startX: Math.max(0, originX - renderDistance),
        startY: Math.max(0, originY - renderDistance),
        endX: Math.min(worldSize - 1, originX + renderDistance),
        endY: Math.min(worldSize - 1, originY + renderDistance)
    };

    for (let y = coords.startY; y <= coords.endY; y++) {
        for (let x = coords.startX; x <= coords.endX; x++) {
            const chunk = await getRedisClient().json
                .get<Chunk>(worldCode, `$.chunks[${y}][${x}]`);
            
            if (!chunk) continue;

            yield { x, y, chunk };
        }
    }
}