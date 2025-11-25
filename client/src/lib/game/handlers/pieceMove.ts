import { Point } from "pixi.js";

import { createPacketHandler } from "../SocketClient";
import { attackSound, playMoveSound } from "../constants/move-sounds";

export const pieceMoveHandler = createPacketHandler({
    type: "pieceMove",
    handle: async (packet, client) => {
        const fromSquare = client.world.getLocalSquare(
            packet.fromX, packet.fromY
        );
        if (!fromSquare?.entity) return;

        const toSquare = client.world.getLocalSquare(
            packet.toX, packet.toY
        );
        if (!toSquare) return fromSquare.setEntity(undefined);

        if (packet.attack) {
            attackSound.play();

            return fromSquare.entity.attackSquare(
                packet.toX, packet.toY, true
            );
        }

        playMoveSound(toSquare);

        fromSquare.entity.setPosition(
            new Point(packet.toX, packet.toY),
            { animate: true }
        );

        fromSquare.moveEntity(toSquare);
    }
});