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

        for (const position in packet.runtimeChunk) {
            const { x: relativeX, y: relativeY } = coordinateIndex(position);

            const squarePosition = new Point(
                packet.x * chunkSquareCount + relativeX,
                packet.y * chunkSquareCount + relativeY
            );

            const piece = packet.runtimeChunk[position]!;

            if (client.world.isLocalPlayer(piece)) {
                localChunk.runtimeSquares[position] = (
                    client.world.localPlayer!
                );

                continue;
            }

            const entity = client.world.pieceToEntity(squarePosition, piece);

            localChunk.runtimeSquares[position] = entity;
            entity.spawn();
        }

        packet.chunk.squares.forEach((row, relativeY) => {
            row.forEach((square, relativeX) => {
                const position = new Point(
                    (packet.x * chunkSquareCount) + relativeX,
                    (packet.y * chunkSquareCount) + relativeY 
                );

                drawSquare(client.viewport, position, square.type);

                const entity = square.piece && client.world
                    .pieceToEntity(position, square.piece);

                localChunk.squares[relativeY] ??= [];
                localChunk.squares[relativeY][relativeX] = {
                    ...square, piece: entity
                };

                entity?.spawn();
            });
        });

        client.world.setLocalChunk(packet.x, packet.y, localChunk);
    }
});