import { Point } from "pixi.js";

import { chunkSize, squareSize } from "@/constants/squares";
import { Player } from "../entity/Player";
import { createPacketHandler } from "../SocketClient";

export const serverInformationHandler = createPacketHandler({
    type: "serverInformation",
    handle: (packet, client) => {
        client.worldChunkSize = packet.worldChunkSize;

        // Move camera to local player's location
        client.viewport.moveCenter({
            x: packet.localPlayer.x * squareSize + (squareSize / 2),
            y: packet.localPlayer.y * squareSize + (squareSize / 2)
        });

        // Clamp viewport to the size of the world plus padding
        const minCoordinate = -client.config.viewportPadding;
        const maxCoordinate = (packet.worldChunkSize * chunkSize * squareSize)
            + client.config.viewportPadding;

        client.viewport.worldWidth = client.viewport.worldHeight = Math.abs(
            maxCoordinate - minCoordinate
        );

        client.viewport.clamp({
            left: minCoordinate,
            right: maxCoordinate,
            top: minCoordinate,
            bottom: maxCoordinate
        });

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