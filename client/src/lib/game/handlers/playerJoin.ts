import { createPacketHandler } from "../SocketClient";

export const playerJoinHandler = createPacketHandler({
    type: "playerJoin",
    handle: (packet, client) => {
        client.connectedPlayers[packet.name] = packet;
        client.ui.updatePlayerlist();
    }
});