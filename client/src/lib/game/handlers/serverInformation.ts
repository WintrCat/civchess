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
        client.world.chunkSize = packet.worldChunkSize;
        client.world.playerlist = packet.players;

        client.ui.updatePlayerlist();

        // Move camera and clamp viewport around player
        moveViewportToSquare(client,
            packet.localPlayer.x, packet.localPlayer.y
        );

        clampViewportAroundSquare(client,
            packet.localPlayer.x, packet.localPlayer.y
        );

        client.app.renderer.on("resize", () => {
            if (!client.world.localPlayer) return;

            clampViewportAroundSquare(client,
                client.world.localPlayer.entity.x,
                client.world.localPlayer.entity.y
            );
        });

        // Spawn local player entity
        const localPlayerEntity = new Player({
            client: client,
            position: new Point(packet.localPlayer.x, packet.localPlayer.y),
            colour: parseInt(packet.localPlayer.colour.slice(1), 16),
            controllable: true
        });

        client.world.localPlayer = {
            entity: localPlayerEntity,
            data: packet.localPlayer
        };

        localPlayerEntity.spawn();
    }
});