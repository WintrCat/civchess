import { Point } from "pixi.js";

import { createPacketHandler } from "../SocketClient";
import { Player } from "../entity/Player";
import {
    moveViewportToSquare,
    clampViewportAroundSquare
} from "../utils/viewport";

export const playerInformationHandler = createPacketHandler({
    type: "playerInformation",
    handle: (playerData, client) => {
        // Load local player data
        client.health = playerData.health;
        client.maxHealth = playerData.maxHealth;
        client.ui.updateHealthbar();

        client.inventory = playerData.inventory;

        // Spawn local player entity
        if (playerData.health > 0) {
            const localPlayerEntity = new Player({
                client: client,
                userId: playerData.userId,
                colour: playerData.colour,
                position: new Point(playerData.x, playerData.y),
                controllable: true
            });
            client.world.localPlayer = localPlayerEntity;

            // Place in world if chunks have already loaded
            const square = client.world.getLocalSquare(
                playerData.x, playerData.y
            );
            if (square) square.setEntity(localPlayerEntity);

            localPlayerEntity.spawn();
        }

        // Readjust camera clamp and move camera to player
        clampViewportAroundSquare(client,
            playerData.x, playerData.y
        );

        moveViewportToSquare(client.viewport,
            playerData.x, playerData.y
        );
    }
});