import { Point } from "pixi.js";

import { createPacketHandler } from "../SocketClient";

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

        if (packet.attack) return fromSquare.entity
            .attackSquare(packet.toX, packet.toY, true);

        new Audio(toSquare.entity
            ? "/audio/capture.mp3"
            : "/audio/move.mp3"
        ).play();

        fromSquare.entity.setPosition(
            new Point(packet.toX, packet.toY),
            { animate: true }
        );

        fromSquare.moveEntity(toSquare);
    }
});