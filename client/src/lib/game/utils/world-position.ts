import { Point } from "pixi.js";

import { getChunkCoordinates } from "shared/lib/world-chunks";
import { squareSize, chunkSize } from "@/constants/squares";

/**
 * @description Coordinates are for center of given square
 */
export function squareToWorldPosition(squareX: number, squareY: number): Point;
export function squareToWorldPosition(point: Point): Point;

export function squareToWorldPosition(
    squareXOrPoint: number | Point,
    squareY?: number
) {
    if (squareXOrPoint instanceof Point)
        return new Point(
            (squareXOrPoint.x * squareSize) + (squareSize / 2),
            (squareXOrPoint.y * squareSize) + (squareSize / 2)
        );

    return new Point(
        (squareXOrPoint * squareSize) + (squareSize / 2),
        (squareY! * squareSize) + (squareSize / 2)
    );
}

export function squareChunkWorldPosition(squareX: number, squareY: number) {
    const { chunkX, chunkY } = getChunkCoordinates(squareX, squareY);

    return new Point(chunkX * chunkSize, chunkY * chunkSize);
}

export function worldToSquarePosition(x: number, y: number) {
    return new Point(
        Math.floor(x / squareSize),
        Math.floor(y / squareSize) 
    );
}