import { Graphics, Point } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { SquareType } from "shared/constants/SquareType";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { squareColours, squareSize } from "@/constants/squares";
import { createPacketHandler } from "../SocketClient";
import { PieceType } from "shared/constants/PieceType";
import { Player } from "../entity/Player";
import { coordinateIndex } from "shared/types/world/OnlineWorld";

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

export const worldChunkLoadHandler = createPacketHandler({
    type: "worldChunkLoad",
    handle: (packet, client) => {
        client.world.setChunkCache(packet.x, packet.y, {
            persistent: packet.chunk,
            runtime: packet.runtimeChunk
        });

        for (const position in packet.runtimeChunk) {
            const { x: relativeX, y: relativeY } = coordinateIndex(position);
            
            const squarePosition = new Point(
                packet.x * chunkSquareCount + relativeX,
                packet.y * chunkSquareCount + relativeY
            );

            const piece = packet.runtimeChunk[position];

            if (piece.id == PieceType.PLAYER) {
                const localUserId = client.world.localPlayer?.data.userId;
                if (piece.userId == localUserId) continue;

                const player = new Player({
                    client: client,
                    colour: piece.colour,
                    position: squarePosition
                });

                player.spawn();
            }
        }

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