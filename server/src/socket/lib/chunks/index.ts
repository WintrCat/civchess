import { RuntimeChunk } from "shared/types/world/OnlineWorld";
import { Chunk } from "shared/types/world/Chunk";
import {
    coordinateIndex,
    getChunkCoordinates,
    getSurroundingBounds
} from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";
import { worldChunkSizeKey } from "@/lib/worlds/server";

export function getRenderDistance() {
    return Number(process.env.PUBLIC_RENDER_DISTANCE) || 2;
}

async function getSurroundingChunkBounds(
    squareX: number,
    squareY: number,
    worldCode?: string
) {
    const { chunkX, chunkY } = getChunkCoordinates(squareX, squareY);

    return getSurroundingBounds(chunkX, chunkY, {
        radius: getRenderDistance(),
        max: worldCode ? await getWorldChunkSize(worldCode) : Infinity
    });
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
    const previousBounds = diff && await getSurroundingChunkBounds(
        diff.previousSquareX, diff.previousSquareY
    );

    const bounds = await getSurroundingChunkBounds(
        squareX, squareY, worldCode
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