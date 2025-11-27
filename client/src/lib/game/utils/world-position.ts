import { Point } from "pixi.js";

import { getChunkCoordinates } from "shared/lib/world-chunks";
import { squareSize, chunkSize, halfSquare } from "../constants/squares";

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
            squareXOrPoint.x * squareSize + halfSquare,
            squareXOrPoint.y * squareSize + halfSquare
        );

    return new Point(
        squareXOrPoint * squareSize + halfSquare,
        squareY! * squareSize + halfSquare
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