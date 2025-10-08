import { createPacketHandler } from "../SocketClient";

export const playerLeaveHandler = createPacketHandler({
    type: "playerLeave",
    handle: (packet, client) => {
        delete client.world.playerlist[packet.userId];
        client.ui.updatePlayerlist();
    }
});