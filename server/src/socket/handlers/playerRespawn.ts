import { SocketIdentity } from "@/types/SocketIdentity";
import { createPacketHandler } from "../packets";

export const playerRespawnHandler = createPacketHandler({
    type: "playerRespawn",
    handle: (packet, socket) => {
        const id = socket.data as SocketIdentity;
        if (!id.dead) throw new Error();

        // find new location to spawn or use player's spawnpoint
    }
});