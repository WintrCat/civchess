import { Point } from "pixi.js";

import { createPacketHandler } from "../SocketClient";

export const pieceMoveHandler = createPacketHandler({
    type: "pieceMove",
    handle: (packet, client) => {
        const fromSquare = client.world.getLocalSquare(
            packet.fromX, packet.fromY
        );
        if (!fromSquare) return;

        const toSquare = client.world.getLocalSquare(
            packet.toX, packet.toY
        );
        if (!toSquare) return fromSquare.update({ piece: null });

        fromSquare.entity?.setPosition(
            new Point(packet.toX, packet.toY),
            { animate: true }
        );

        fromSquare.moveEntity(toSquare);
    }
});