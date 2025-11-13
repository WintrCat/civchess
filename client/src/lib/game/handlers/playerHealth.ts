import { createPacketHandler } from "../SocketClient";

export const playerHealthHandler = createPacketHandler({
    type: "playerHealth",
    handle: (packet, client) => {
        client.health = packet.newHealth;
        
        client.ui.updateHealthbar();
    }
});