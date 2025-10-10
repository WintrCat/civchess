import { Server as SocketServer, Socket } from "socket.io";

import { Chunk } from "shared/types/world/Chunk";
import { Piece } from "shared/types/world/Piece";
import {
    ChunkPersistence,
    coordinateIndex,
    RuntimeChunk
} from "shared/types/world/OnlineWorld";
import { getChunkCoordinates } from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";
import { SocketIdentity } from "@/types/SocketIdentity";

export async function getWorldChunkSize(worldCode: string) {
    return await getRedisClient().json.length(worldCode, "$.chunks");
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
    originSquareX: number,
    originSquareY: number,
    renderDistance?: number
) {
    renderDistance ??= Number(process.env.PUBLIC_RENDER_DISTANCE) || 2;

    const worldSize = await getRedisClient().json
        .length(worldCode, "$.chunks");

    const {
        chunkX: originChunkX,
        chunkY: originChunkY
    } = getChunkCoordinates(originSquareX, originSquareY);

    const coords = {
        startX: Math.max(0, originChunkX - renderDistance),
        startY: Math.max(0, originChunkY - renderDistance),
        endX: Math.min(worldSize - 1, originChunkX + renderDistance),
        endY: Math.min(worldSize - 1, originChunkY + renderDistance)
    };

    for (let y = coords.startY; y <= coords.endY; y++) {
        for (let x = coords.startX; x <= coords.endX; x++) {
            const chunk = await getChunk(worldCode, x, y);
            if (!chunk) continue;

            const runtimeChunk = await getRuntimeChunk(worldCode, x, y);

            yield { x, y, chunk, runtimeChunk };
        }
    }
}

export async function setChunkSubscription(
    socket: Socket,
    x: number,
    y: number,
    subscribed: boolean
) {
    const identity = socket.data as SocketIdentity;
    const subRoom = `${identity.worldCode}:chunk-${x}-${y}`;

    if (subscribed) {
        await socket.join(subRoom);
    } else {
        await socket.leave(subRoom);
    }
}

export function getChunkBroadcaster(
    socket: Socket | SocketServer,
    worldCode: string,
    x: number,
    y: number
) {
    if (socket instanceof SocketServer)
        return socket.to(`${worldCode}:chunk-${x}-${y}`);

    return socket.broadcast.to(`${worldCode}:chunk-${x}-${y}`);
}

export async function setSquarePiece(
    worldCode: string,
    squareX: number,
    squareY: number,
    piece: Piece | undefined,
    persistence: ChunkPersistence = "persistent"
) {
    const { chunkX, chunkY, relativeX, relativeY } = (
        getChunkCoordinates(squareX, squareY)
    );

    let piecePath: string;

    if (persistence == "persistent") {
        piecePath = `$.chunks[${chunkY}][${chunkX}]`
            + `.squares[${relativeY}][${relativeX}].piece`;
    } else {
        const runtimeChunkPath = "$.runtimeChunks"
            + `["${coordinateIndex(chunkX, chunkY)}"]`;

        if (piece) await getRedisClient().json.set(
            worldCode, runtimeChunkPath, {}, "NX"
        );

        piecePath = runtimeChunkPath
            + `["${coordinateIndex(relativeX, relativeY)}"]`;
    }

    if (piece) {
        await getRedisClient().json.set(worldCode, piecePath, piece);
    } else {
        await getRedisClient().json.delete(worldCode, piecePath);
    }
}