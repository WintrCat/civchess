import { createPacketHandler } from "../SocketClient";

export const playerLeaveHandler = createPacketHandler({
    type: "playerLeave",
    handle: (packet, client) => {
        delete client.connectedPlayers[packet.username];
        client.ui.updatePlayerlist();
    }
});