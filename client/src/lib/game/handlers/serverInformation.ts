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

        client.world.playerlist = Object.fromEntries(
            packet.players.map(profile => [profile.userId, profile])
        );

        client.ui.updatePlayerlist();

        // Spawn local player entity
        const localPlayerEntity = new Player({
            client: client,
            userId: packet.localPlayer.userId,
            colour: packet.localPlayer.colour,
            position: new Point(packet.localPlayer.x, packet.localPlayer.y),
            health: 3,
            inventory: packet.localPlayer.inventory,
            controllable: true
        });
        client.world.localPlayer = localPlayerEntity;

        localPlayerEntity.spawn();

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
                client.world.localPlayer.x,
                client.world.localPlayer.y
            );
        });
    }
});