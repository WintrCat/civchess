import { Point } from "pixi.js";

import { Player } from "../entity/Player";
import { createPacketHandler } from "../SocketClient";
import {
    clampViewportAroundSquare,
    moveViewportToSquare
} from "../utils/viewport";

export const serverInformationHandler = createPacketHandler({
    type: "serverInformation",
    handle: (packet, client) => {
        client.worldChunkSize = packet.worldChunkSize;

        moveViewportToSquare(client,
            packet.localPlayer.x, packet.localPlayer.y
        );

        clampViewportAroundSquare(client,
            packet.localPlayer.x, packet.localPlayer.y
        );

        // Spawn local player entity
        client.localPlayer = new Player({
            client: client,
            position: new Point(packet.localPlayer.x, packet.localPlayer.y),
            colour: parseInt(packet.localPlayer.colour.slice(1), 16),
            controllable: true
        });

        client.localPlayer.spawn();
    }
});