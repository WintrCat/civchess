import { Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { SquareType } from "shared/constants/SquareType";
import { squareColours } from "@/constants/square-colours";
import { createPacketHandler } from "../Client";

const chunkSize = 8;
const squareSize = 80;

function drawSquare(
    viewport: Viewport,
    squareX: number,
    squareY: number,
    type: SquareType
) {
    const squareShade = (squareX + squareY) % 2 == 0 ? "light" : "dark";

    const graphics = new Graphics()
        .rect(
            squareX * squareSize, squareY * squareSize,
            squareSize, squareSize
        )
        .fill(squareColours[type][squareShade]);

    graphics.cullable = true;

    viewport.addChild(graphics);
}

export const worldChunkHandler = createPacketHandler({
    type: "worldChunk",
    handle: (packet, viewport) => {
        packet.chunk.squares.forEach((row, relativeY) => {
            row.forEach((square, relativeX) => drawSquare(
                viewport,
                (packet.x * chunkSize) + relativeX,
                (packet.y * chunkSize) + relativeY,
                square.type
            ));
        });
    }
});