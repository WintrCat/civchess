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
    const id = socket.data;

    if (id.shutdownQueued) return;

    // Remove player piece from runtime chunks before checking for other sockets
    // This prevents ghost pieces when the last socket disconnects
    if (!id.dead) {
        const player = await getPlayer(
            id.worldCode, id.profile.userId
        );
        if (player) {
            await setSquarePiece(id.worldCode,
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
                server, id.worldCode, chunkX, chunkY
            )); 
        }
    }

    // If there are other active sockets for this user, skip cleanup
    const socketsForUser = await server.in(id.profile.userId).fetchSockets();
    const otherSockets = socketsForUser.filter(s => s.id != socket.id);
    if (otherSockets.length > 0) return;

    // Decrement player count and notify others of leave
    await decrementPlayerCount(id.worldCode);

    sendPacket("playerLeave", {
        userId: id.profile.userId
    }, server.to(id.worldCode));
}