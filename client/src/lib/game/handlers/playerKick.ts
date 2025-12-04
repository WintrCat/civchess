import { createPacketHandler } from "../SocketClient";

export const playerKickHandler = createPacketHandler({
    type: "playerKick",
    handle: (packet, client) => {
        client.ui.setKickDialog({
            title: packet.title,
            reason: packet.reason
        });
    }
});