import { Player } from "../entity/Player";
import { createPacketHandler } from "../SocketClient";

export const playerUpdateHandler = createPacketHandler({
    type: "playerUpdate",
    handle: (packet, client) => {
        const square = client.world.getLocalSquare(packet.x, packet.y);
        if (!(square?.entity instanceof Player)) return;

        if (packet.health != undefined)
            square.entity.health = packet.health;

        if (packet.colour)
            square.entity.setColour(packet.colour);
    }
});