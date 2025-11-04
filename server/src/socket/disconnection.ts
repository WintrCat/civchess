import { Socket, Server as SocketServer } from "socket.io";

import { coordinateIndex } from "shared/lib/world-chunks";
import { getChunkCoordinates } from "shared/lib/world-chunks";
import { isIdentified } from "@/types/SocketIdentity";
import { setSquarePiece } from "./lib/chunks/squares";
import { getChunkBroadcaster } from "./lib/chunks/subscribers";
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

    sendPacket("playerLeave", {
        userId: identity.profile.userId
    }, server.to(identity.worldCode));

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

    sendPacket("worldChunkUpdate", {
        x: chunkX,
        y: chunkY,
        runtimeChanges: {
            [coordinateIndex(relativeX, relativeY)]: null
        }
    }, getChunkBroadcaster(
        server, identity.worldCode, chunkX, chunkY
    ));
}