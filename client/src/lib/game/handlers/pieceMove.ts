import { Point } from "pixi.js";

import { createPacketHandler } from "../SocketClient";

export const pieceMoveHandler = createPacketHandler({
    type: "pieceMove",
    handle: async (packet, client) => {
        const fromSquare = client.world.getLocalSquare(
            packet.fromX, packet.fromY
        );
        if (!fromSquare) return;

        const toSquare = client.world.getLocalSquare(
            packet.toX, packet.toY
        );
        if (!toSquare) return fromSquare.setEntity(undefined);

        if (packet.attack) {
            await fromSquare.entity?.setPosition(
                new Point(packet.toX, packet.toY),
                { animate: true, visualOnly: true, animationDuration: 0.1 }
            );

            await fromSquare.entity?.setPosition(
                new Point(packet.fromX, packet.fromY),
                { animate: true, visualOnly: true, animationDuration: 0.1 }
            );

            return;
        }

        fromSquare.entity?.setPosition(
            new Point(packet.toX, packet.toY),
            { animate: true }
        );

        fromSquare.moveEntity(toSquare);
    }
});