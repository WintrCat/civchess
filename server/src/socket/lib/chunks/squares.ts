import { ChunkLayer } from "shared/types/world/OnlineWorld";
import { Piece } from "shared/types/world/Piece";
import { getChunkCoordinates, coordinateIndex } from "shared/lib/world-chunks";
import { getRedisClient } from "@/database/redis";

async function getPiecePath(
    worldCode: string,
    squareX: number,
    squareY: number,
    layer: ChunkLayer = "persistent"
) {
    const { chunkX, chunkY, relativeX, relativeY } = (
        getChunkCoordinates(squareX, squareY)
    );

    if (layer == "runtime") {
        const runtimeChunkPath = "$.runtimeChunks"
            + `["${coordinateIndex(chunkX, chunkY)}"]`;

        await getRedisClient().json.set(
            worldCode, runtimeChunkPath, {}, "NX"
        );

        return runtimeChunkPath
            + `["${coordinateIndex(relativeX, relativeY)}"]`;
    }

    return `$.chunks[${chunkY}][${chunkX}]`
        + `.squares[${relativeY}][${relativeX}].piece`;
}

export async function setSquarePiece(
    worldCode: string,
    squareX: number,
    squareY: number,
    piece: Piece | undefined,
    layer: ChunkLayer = "persistent"
) {
    const piecePath = await getPiecePath(
        worldCode, squareX, squareY, layer
    );

    if (piece) {
        await getRedisClient().json.set(worldCode, piecePath, piece);
    } else {
        await getRedisClient().json.delete(worldCode, piecePath);
    }
}

export async function moveSquarePiece(
    worldCode: string,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    layer: ChunkLayer = "persistent"
) {
    const fromPiecePath = await getPiecePath(
        worldCode, fromX, fromY, layer
    );

    const toPiecePath = await getPiecePath(
        worldCode, toX, toY, layer
    );

    await getRedisClient().json.move(
        worldCode, fromPiecePath, toPiecePath
    );
}