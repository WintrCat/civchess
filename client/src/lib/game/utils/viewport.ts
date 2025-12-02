import { Container } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { chunkSize } from "../constants/squares";
import { InitialisedGameClient } from "../Client";
import {
    squareChunkWorldPosition,
    squareToWorldPosition
} from "./world-position";

export function isVisibleInViewport(
    viewport: Viewport,
    container: Container
) {
    const vpBounds = viewport.getVisibleBounds();
    const containerBounds = container.getBounds();

    const minCoord = viewport.toWorld(
        containerBounds.minX, containerBounds.minY
    );

    const maxCoord = viewport.toWorld(
        containerBounds.maxX, containerBounds.maxY
    );

    return maxCoord.x > vpBounds.left
        && minCoord.x < vpBounds.right
        && maxCoord.y > vpBounds.top
        && minCoord.y < vpBounds.bottom;
}

export function clampViewportAroundSquare(
    client: InitialisedGameClient,
    squareX: number,
    squareY: number
) {
    const renderDistancePx = chunkSize * client.renderDistance;
    const chunkPosition = squareChunkWorldPosition(squareX, squareY);

    const minCoord = (coord: number) => Math.max(
        0, coord - renderDistancePx
    );

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
    viewport: Viewport,
    squareX: number,
    squareY: number
) {
    viewport.moveCenter(squareToWorldPosition(squareX, squareY));
}