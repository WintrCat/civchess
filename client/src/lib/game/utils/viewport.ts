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

<<<<<<< Updated upstream
    const minCoordinate = Math.max(0, chunkPosition.x - renderDistance);
=======
    const minCoord = (coord: number) => Math.max(0, coord - renderDistance);
>>>>>>> Stashed changes

    const maxCoord = (coord: number) => Math.min(
        (client.worldChunkSize || Infinity) * chunkSize,
<<<<<<< Updated upstream
        chunkPosition.x + chunkSize + renderDistance
=======
        coord + chunkSize + renderDistance
>>>>>>> Stashed changes
    );

    client.viewport.worldWidth = client.viewport.worldHeight = Math.abs(
        maxCoord(spawnChunkSquare.x) - minCoord(spawnChunkSquare.x)
    );

    client.viewport.clamp({
        left: minCoord(spawnChunkSquare.x),
        right: maxCoord(spawnChunkSquare.x),
        top: minCoord(spawnChunkSquare.y),
        bottom: maxCoord(spawnChunkSquare.y)
    });
}

export function moveViewportToSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    client.viewport.moveCenter(toWorldPosition(squareX, squareY));
}
