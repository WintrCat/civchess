import { Socket } from "socket.io";

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

export function setChunkSubscription(
    socket: Socket,
    worldCode: string,
    x: number,
    y: number,
    subscribed: boolean
) {
    const subRoom = `${worldCode}:chunk-${x}-${y}`;

    if (subscribed) {
        socket.join(subRoom);
    } else {
        socket.leave(subRoom);
    }
}

export function getChunkBroadcaster(
    socket: Socket,
    worldCode: string,
    x: number,
    y: number 
) {
    return socket.broadcast.to(`${worldCode}:chunk-${x}-${y}`);
}