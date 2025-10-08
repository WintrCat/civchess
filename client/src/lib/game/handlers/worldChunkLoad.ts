import { Graphics, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { SquareType } from "shared/constants/SquareType";
import { coordinateIndex } from "shared/types/world/OnlineWorld";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { squareColours, squareSize } from "@/constants/squares";
import { LocalChunk } from "../types/chunks";
import { createPacketHandler } from "../SocketClient";

function drawSquare(
    viewport: Viewport,
    position: Point,
    type: SquareType
) {
    const squareShade = (position.x + position.y) % 2 == 0
        ? "light" : "dark";

    const graphics = new Graphics()
        .rect(
            position.x * squareSize, position.y * squareSize,
            squareSize, squareSize
        )
        .fill(squareColours[type][squareShade]);

    graphics.cullable = true;

    viewport.addChild(graphics);
}

export const worldChunkLoadHandler = createPacketHandler({
    type: "worldChunkLoad",
    handle: (packet, client) => {
        const localChunk: LocalChunk = {
            squares: [],
            runtimeSquares: {}
        };

        localChunk.squares = packet.chunk.squares.map((row, relY) => (
            row.map((square, relX) => {
                const squareX = packet.x * chunkSquareCount + relX;
                const squareY = packet.y * chunkSquareCount + relY;

                drawSquare(
                    client.viewport,
                    new Point(squareX, squareY),
                    square.type
                );

                const entity = square.piece && client.world.pieceToEntity(
                    squareX, squareY, square.piece
                );

                entity?.spawn();

                return { ...square, piece: entity };
            })
        ));

        localChunk.runtimeSquares = Object.fromEntries(
            Object.entries(packet.runtimeChunk).map(([pos, piece]) => {
                if (client.world.isLocalPlayer(piece))
                    return [pos, client.world.localPlayer!];

                const { x: relX, y: relY } = coordinateIndex(pos);

                const entity = client.world.pieceToEntity(
                    packet.x * chunkSquareCount + relX,
                    packet.y * chunkSquareCount + relY,
                    piece
                );

                return [pos, entity];
            })
        );

        client.world.setLocalChunk(packet.x, packet.y, localChunk);
    }
});