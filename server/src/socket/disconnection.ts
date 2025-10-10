import { Socket, Server as SocketServer } from "socket.io";

import { coordinateIndex } from "shared/types/world/OnlineWorld";
import { getChunkCoordinates } from "shared/lib/world-chunks";
import { isIdentified } from "@/types/SocketIdentity";
import { setSquarePiece, getChunkBroadcaster } from "./lib/world-chunks";
import { getPlayer } from "./lib/players";
import { decrementPlayerCount } from "./lib/players/count";
import { sendPacket } from "./packets";

export async function handleDisconnect(
    server: SocketServer,
    socket: Socket
) {
    if (!isIdentified(socket.data)) return;
    const identity = socket.data;

    // Decrement player count and notify others of leave
    await decrementPlayerCount(identity.worldCode);

    sendPacket(server, "playerLeave", {
        userId: identity.profile.userId
    }, sender => sender.to(identity.worldCode));

    // Remove player piece from runtime chunks
    const player = await getPlayer(
        identity.worldCode, identity.profile.userId
    );
    if (!player) return;

    await setSquarePiece(identity.worldCode,
        player.x, player.y, undefined, "runtime"
    );

    // Send chunk subscribers a despawn event
    const { chunkX, chunkY, relativeX, relativeY } = (
        getChunkCoordinates(player.x, player.y)
    );

    sendPacket(server, "worldChunkUpdate", {
        x: chunkX,
        y: chunkY,
        runtimeChanges: {
            [coordinateIndex(relativeX, relativeY)]: null
        }
    }, sender => getChunkBroadcaster(
        sender, identity.worldCode, chunkX, chunkY
    ));
}