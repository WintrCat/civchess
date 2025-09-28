import { Graphics } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { SquareType } from "shared/constants/SquareType";
import {
    squareColours,
    squareSize,
    chunkSquareCount
} from "@/constants/squares";
import { createPacketHandler } from "../SocketClient";

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
    handle: (packet, client) => {
        client.setChunkCache(packet.x, packet.y, packet.chunk);

        packet.chunk.squares.forEach((row, relativeY) => {
            row.forEach((square, relativeX) => drawSquare(
                client.viewport,
                (packet.x * chunkSquareCount) + relativeX,
                (packet.y * chunkSquareCount) + relativeY,
                square.type
            ));
        });
    }
});