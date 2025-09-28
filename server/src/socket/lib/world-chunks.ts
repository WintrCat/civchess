import { getRedisClient } from "@/database/redis";
import { OnlineChunk } from "@/types/OnlineWorld";

export function getChunkCoordinates(squareX: number, squareY: number) {
    return { x: Math.floor(squareX / 8), y: Math.floor(squareY / 8) };
}

export async function getChunk(
    worldCode: string, chunkX: number, chunkY: number
) {
    return await getRedisClient().json.get<OnlineChunk>(
        worldCode, `$.chunks[${chunkY}][${chunkX}]`
    );
}

export async function getSquareChunk(
    worldCode: string, squareX: number, squareY: number
) {
    const { x, y } = getChunkCoordinates(squareX, squareY);

    return await getChunk(worldCode, x, y);
}

export async function* getSurroundingChunks(
    worldCode: string,
    originSquareX: number,
    originSquareY: number,
    renderDistance?: number
) {
    renderDistance ??= Number(process.env.RENDER_DISTANCE) || 3;

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
            const chunk = await getChunk(worldCode, x, y);
            if (!chunk) continue;

            yield { x, y, chunk };
        }
    }
}

export async function setChunkSubscription(
    worldCode: string,
    x: number,
    y: number,
    userId: string,
    subscribed: boolean
) {
    const path = `$.chunks[${y}][${x}].subscribers.${userId}`;

    if (subscribed) {
        await getRedisClient().json.set(worldCode, path, true);
    } else {
        await getRedisClient().json.delete(worldCode, path);
    }
}

export async function getChunkSubscription(
    worldCode: string,
    x: number,
    y: number,
    userId: string
) {
    const value = await getRedisClient().json.get(worldCode,
        `$.chunks[${y}][${x}].subscribers.${userId}`
    );

    return !!value;
}