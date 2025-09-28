import { mapValues } from "es-toolkit";

import { getChunkCoordinates } from "shared/lib/world-chunks";
import { squareSize, chunkSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";

const renderDistance = chunkSize * (
    Number(import.meta.env.PUBLIC_RENDER_DISTANCE) || 2
);

export function clampViewportAroundSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    const spawnChunkSquare = mapValues(
        getChunkCoordinates(squareX, squareY),
        coordinate => coordinate * chunkSize
    );

    const minCoordinate = Math.max(0, spawnChunkSquare.x - renderDistance);

    const maxCoordinate = Math.min(
        (client.worldChunkSize || Infinity) * chunkSize,
        spawnChunkSquare.x + chunkSize + renderDistance
    );

    client.viewport.worldWidth = client.viewport.worldHeight = Math.abs(
        maxCoordinate - minCoordinate
    );

    client.viewport.clamp({
        left: minCoordinate,
        right: maxCoordinate,
        top: minCoordinate,
        bottom: maxCoordinate
    });
}

export function moveViewportToSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    client.viewport.moveCenter({
        x: squareX * squareSize + (squareSize / 2),
        y: squareY * squareSize + (squareSize / 2)
    });
}