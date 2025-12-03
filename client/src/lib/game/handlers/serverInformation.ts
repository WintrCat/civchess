import { createPacketHandler } from "../SocketClient";

export const serverInformationHandler = createPacketHandler({
    type: "serverInformation",
    handle: (packet, client) => {
        client.world.chunkSize = packet.worldChunkSize;
        client.world.renderDistance = packet.renderDistance;

        // Load connected players list
        client.world.playerlist = Object.fromEntries(
            packet.players.map(profile => [profile.userId, profile])
        );

        client.ui.updatePlayerlist();
    }
});