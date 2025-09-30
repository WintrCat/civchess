import { mapValues } from "es-toolkit";

import { getChunkCoordinates } from "shared/lib/world-chunks";
import { squareSize, chunkSize } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { toWorldPosition } from "./square-position";

const renderDistance = chunkSize * (
    Number(import.meta.env.PUBLIC_RENDER_DISTANCE) || 2
);

export function clampViewportAroundSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    const chunkPosition = mapValues(
        getChunkCoordinates(squareX, squareY),
        coordinate => coordinate * chunkSize
    );

    const minCoordinate = Math.max(0, chunkPosition.x - renderDistance);

    const maxCoordinate = Math.min(
        (client.worldChunkSize || Infinity) * chunkSize,
        chunkPosition.x + chunkSize + renderDistance
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
    client.viewport.moveCenter(toWorldPosition(squareX, squareY));
}
