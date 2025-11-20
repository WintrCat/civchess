import { randomInt } from "es-toolkit";

import { maxPlayerHealth } from "shared/constants/player-stats";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getWorldChunkSize } from "../lib/chunks";
import { createPacketHandler } from "../packets";
import { getPlayer } from "../lib/players";
import { spawnPlayer } from "../lib/players/spawn";

export const playerRespawnHandler = createPacketHandler({
    type: "playerRespawn",
    handle: async (packet, socket) => {
        const id = socket.data as SocketIdentity;
        if (!id.dead) throw new Error("respawn cannot be done alive");

        id.dead = false;

        const worldChunkSize = await getWorldChunkSize(id.worldCode);

        const playerData = await getPlayer(id.worldCode, id.profile.userId);
        if (!playerData) throw new Error();

        playerData.health = maxPlayerHealth;

        // Randomly pick location for respawn
        playerData.x = randomInt(0, worldChunkSize * chunkSquareCount);
        playerData.y = randomInt(0, worldChunkSize * chunkSquareCount);

        await spawnPlayer(socket, playerData);
    }
});