import { createPacketHandler } from "../SocketClient";

export const playerJoinHandler = createPacketHandler({
    type: "playerJoin",
    handle: (packet, client) => {
        client.world.playerlist[packet.userId] = packet;
        client.ui.updatePlayerlist();
    }
});