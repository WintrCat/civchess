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

    const minCoord = (coord: number) => Math.max(0, coord - renderDistance);

    const maxCoord = (coord: number) => Math.min(
        (client.worldChunkSize || Infinity) * chunkSize,
        coord + chunkSize + renderDistance
    );

    client.viewport.worldWidth = client.viewport.worldHeight = Math.abs(
        maxCoord(chunkPosition.x) - minCoord(chunkPosition.x)
    );

    client.viewport.clamp({
        left: minCoord(chunkPosition.x),
        right: maxCoord(chunkPosition.x),
        top: minCoord(chunkPosition.y),
        bottom: maxCoord(chunkPosition.y)
    });
}

export function moveViewportToSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    client.viewport.moveCenter(toWorldPosition(squareX, squareY));
}
