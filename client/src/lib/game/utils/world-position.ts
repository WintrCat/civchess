import { Point } from "pixi.js";

import { getChunkCoordinates } from "shared/lib/world-chunks";
import { squareSize, chunkSize } from "@/constants/squares";

/**
 * @description Coordinates are for center of given square
 */
export function squareWorldPosition(squareX: number, squareY: number) {
    return new Point(
        (squareX * squareSize) + (squareSize / 2),
        (squareY * squareSize) + (squareSize / 2)
    );
}

export function squareChunkWorldPosition(squareX: number, squareY: number) {
    const { chunkX, chunkY } = getChunkCoordinates(squareX, squareY);

    return new Point(chunkX * chunkSize, chunkY * chunkSize);
}