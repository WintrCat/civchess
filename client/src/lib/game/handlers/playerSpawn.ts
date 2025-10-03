import { Point } from "pixi.js";

import { Player } from "../entity/Player";
import { createPacketHandler } from "../SocketClient";

export const playerSpawnHandler = createPacketHandler({
    type: "playerSpawn",
    handle: (packet, client) => {
        const player = new Player({
            client: client,
            colour: packet.colour,
            position: new Point(packet.x, packet.y)
        });

        player.spawn();
    }
});