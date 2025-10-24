import { chunkSize, renderDistance } from "@/constants/squares";
import { InitialisedGameClient } from "../Client";
import { squareChunkWorldPosition, squareToWorldPosition } from "./world-position";

const renderDistancePx = chunkSize * renderDistance;

export function clampViewportAroundSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    const chunkPosition = squareChunkWorldPosition(squareX, squareY);

    const minCoord = (coord: number) => Math.max(0, coord - renderDistancePx);

    const maxCoord = (coord: number) => Math.min(
        (client.world.chunkSize || Infinity) * chunkSize,
        coord + chunkSize + renderDistancePx
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
    client.viewport.moveCenter(
        squareToWorldPosition(squareX, squareY)
    );
}