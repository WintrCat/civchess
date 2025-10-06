import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { isIdentified } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { setSquarePiece } from "./lib/world-chunks";
import { getPlayer } from "./lib/players";
import { decrementPlayerCount } from "./lib/players/count";
import { packetMiddleware } from "./middleware";
import { attachPacketHandlers, sendPacket } from "./packets";
import handlers from "./handlers";

let instance: SocketServer | null = null;

export function createSocketServer(httpServer: HTTPServer) {
    const server = new SocketServer(httpServer, {
        path: "/api/socket",
        transports: ["websocket"],
        adapter: createAdapter(
            getRedisClient(),
            getRedisClient().duplicate()
        ),
        cors: {
            origin: [process.env.PUBLIC_ORIGIN, process.env.PUBLIC_DEV_ORIGIN]
                .filter(origin => origin != undefined)
        }
    });

    server.on("connect", socket => {
        attachPacketHandlers(socket, handlers, packetMiddleware);

        socket.on("disconnect", async () => {
            if (!isIdentified(socket.data)) return;
            const identity = socket.data;

            // Remove player piece from runtime chunks
            const player = await getPlayer(
                identity.worldCode, identity.profile.userId
            );

            if (player) await setSquarePiece(identity.worldCode,
                player.x, player.y, undefined, "runtime"
            );

            // Decrement player count and notify others of leave
            await decrementPlayerCount(identity.worldCode);

            sendPacket(server, "playerLeave", {
                username: identity.profile.name
            }, sender => sender.to(identity.worldCode));
        });
    });

    return instance = server;
}

export function getSocketServer() {
    if (!instance)
        throw new Error("socket server referenced before creation.");

    return instance;
}