import { chunkSize, squareSize } from "@/constants/squares";
import { Player } from "../Player";
import { createPacketHandler } from "../Client";

export const serverInformationHandler = createPacketHandler({
    type: "serverInformation",
    handle: (packet, viewport, client) => {
        viewport.moveCenter({
            x: packet.localPlayer.x * squareSize + (squareSize / 2),
            y: packet.localPlayer.y * squareSize + (squareSize / 2)
        });

        const minCoordinate = -client.config.viewportPadding;
        const maxCoordinate = (packet.worldChunkSize * chunkSize * squareSize)
            + client.config.viewportPadding;

        viewport.worldWidth = viewport.worldHeight = Math.abs(
            maxCoordinate - minCoordinate
        );

        viewport.clamp({
            left: minCoordinate,
            right: maxCoordinate,
            top: minCoordinate,
            bottom: maxCoordinate
        });

        const colour = parseInt(packet.localPlayer.colour.slice(1), 16);

        client.localPlayer = new Player({
            viewport: viewport,
            colour: colour,
            controllable: true,
            x: packet.localPlayer.x,
            y: packet.localPlayer.y
        });

        client.localPlayer.spawn();
    }
});