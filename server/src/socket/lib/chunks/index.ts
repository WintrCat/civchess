import { RuntimeChunk } from "shared/types/world/OnlineWorld";
import { Chunk } from "shared/types/world/Chunk";
import { coordinateIndex, getChunkCoordinates } from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";
import { worldChunkSizeKey } from "@/lib/worlds/server";

function getRenderDistance() {
    return Number(process.env.PUBLIC_RENDER_DISTANCE) || 2;
}

async function getSurroundingChunkBounds(
    worldCode: string,
    squareX: number,
    squareY: number,
    respectWorldSize = true
) {
    const renderDistance = getRenderDistance();
    const worldSize = respectWorldSize
        ? await getWorldChunkSize(worldCode)
        : Infinity;

    const { chunkX, chunkY } = getChunkCoordinates(squareX, squareY);

    return {
        startX: Math.max(0, chunkX - renderDistance),
        startY: Math.max(0, chunkY - renderDistance),
        endX: Math.min(worldSize - 1, chunkX + renderDistance),
        endY: Math.min(worldSize - 1, chunkY + renderDistance)
    };
}

export async function getWorldChunkSize(worldCode: string) {
    const cacheKey = worldChunkSizeKey(worldCode);

    const cachedSize = await getRedisClient().json
        .get<number>(cacheKey, "$");

    if (!cachedSize) {
        const fetchedSize = await getRedisClient().json
            .length(worldCode, "$.chunks");

        await getRedisClient().json.set(cacheKey, "$", fetchedSize);

        return fetchedSize;
    }

    return cachedSize;
}

export async function getChunk(
    worldCode: string,
    chunkX: number,
    chunkY: number
) {
    return await getRedisClient().json.get<Chunk>(
        worldCode, `$.chunks[${chunkY}][${chunkX}]`
    );
}

export async function getRuntimeChunk(
    worldCode: string,
    chunkX: number,
    chunkY: number
) {
    return await getRedisClient().json.get<RuntimeChunk>(worldCode,
        `$.runtimeChunks["${coordinateIndex(chunkX, chunkY)}"]`
    ) || {};
}

export async function* getSurroundingChunks(
    worldCode: string,
    squareX: number,
    squareY: number,
    diff?: {
        previousSquareX: number,
        previousSquareY: number
    }
) {
    const bounds = await getSurroundingChunkBounds(
        worldCode, squareX, squareY
    );

    const previousBounds = diff && await getSurroundingChunkBounds(
        worldCode, diff.previousSquareX, diff.previousSquareY
    );

    for (let y = bounds.startY; y <= bounds.endY; y++) {
        for (let x = bounds.startX; x <= bounds.endX; x++) {
            if (
                previousBounds
                && x >= previousBounds.startX && x <= previousBounds.endX
                && y >= previousBounds.startY && y <= previousBounds.endY
            ) continue;

            const chunk = await getChunk(worldCode, x, y);
            if (!chunk) continue;

            const runtimeChunk = await getRuntimeChunk(worldCode, x, y);

            yield { x, y, chunk, runtimeChunk };
        }
    }
}