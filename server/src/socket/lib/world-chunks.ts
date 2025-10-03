import { Socket } from "socket.io";

import { Square } from "shared/types/world/Square";
import { Chunk } from "shared/types/world/Chunk";
import { chunkSquareCount, getChunkCoordinates } from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";
import { SocketIdentity } from "@/types/SocketIdentity";

export async function getWorldChunkSize(worldCode: string) {
    return await getRedisClient().json.length(worldCode, "$.chunks");
}

export async function getChunk(
    worldCode: string, chunkX: number, chunkY: number
) {
    return await getRedisClient().json.get<Chunk>(
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
    renderDistance ??= Number(process.env.PUBLIC_RENDER_DISTANCE) || 2;

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

export async function setSquare(
    worldCode: string,
    squareX: number,
    squareY: number,
    updates: Partial<Square>
) {
    const { x: chunkX, y: chunkY } = getChunkCoordinates(squareX, squareY);

    const relativeX = squareX % chunkSquareCount;
    const relativeY = squareY % chunkSquareCount;

    const squarePath = `$.chunks[${chunkY}][${chunkX}]`
        + `.squares[${relativeY}][${relativeX}]`;

    const square = await getRedisClient().json
        .get<Square>(worldCode, squarePath);
    if (!square) return;

    for (const [ key, value ] of Object.entries(updates)) {
        await getRedisClient().json.set(worldCode,
            `${squarePath}.${key}`, value
        );
    }
}

export function setChunkSubscription(
    socket: Socket,
    x: number,
    y: number,
    subscribed: boolean
) {
    const identity = socket.data as SocketIdentity;
    const subRoom = `${identity.worldCode}:chunk-${x}-${y}`;

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