import { Point } from "pixi.js";

import { squareSize } from "@/constants/squares";

/**
 * @description Square position to canvas coordinates
 * (center of square)
 */
export function toWorldPosition(x: number, y: number) {
    return new Point(
        (x * squareSize) + (squareSize / 2),
        (y * squareSize) + (squareSize / 2)
    );
}