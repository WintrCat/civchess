import { createPacketHandler } from "../SocketClient";

export const playerHealthHandler = createPacketHandler({
    type: "playerHealth",
    handle: (packet, client) => {
        client.health = packet.newHealth;
        client.ui.updateHealthbar();

        if (client.health > 0) return;

        // player death logic, maybe dialog
        console.log("you died lol");
    }
});