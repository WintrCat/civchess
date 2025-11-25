import { RuntimeChunk } from "shared/types/world/OnlineWorld";
import { Chunk } from "shared/types/world/Chunk";
import { getSurroundingPoints } from "shared/lib/surrounding-positions";
import { coordinateIndex } from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";
import { config } from "@/lib/config";
import { worldChunkSizeKey } from "@/lib/worlds/server";

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

interface SurroundingChunksOptions {
    worldCode: string;
    chunkX: number;
    chunkY: number;
    worldChunkSize: number;
    differenceFrom?: {
        prevChunkX: number;
        prevChunkY: number;
    };
}

export function getSurroundingChunkPoints(
    opts: SurroundingChunksOptions
) {
    return getSurroundingPoints({
        originX: opts.chunkX,
        originY: opts.chunkY,
        differenceFrom: opts.differenceFrom && {
            originX: opts.differenceFrom.prevChunkX,
            originY: opts.differenceFrom.prevChunkY
        },
        includeCenter: true,
        max: opts.worldChunkSize,
        radius: config.renderDistance
    });
}

export async function* getSurroundingChunks(
    opts: SurroundingChunksOptions
) {
    const chunkPoints = getSurroundingChunkPoints(opts);

    for (const point of chunkPoints) {
        const chunk = await getChunk(
            opts.worldCode, point.x, point.y
        );
        if (!chunk) continue;

        const runtimeChunk = await getRuntimeChunk(
            opts.worldCode, point.x, point.y
        );

        yield { ...point, chunk, runtimeChunk };
    }
}