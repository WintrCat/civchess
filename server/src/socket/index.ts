import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { getRedisClient } from "@/database/redis";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getPlayerSocket, playerDeathEvent } from "./lib/players";
import { packetMiddleware } from "./middleware";
import { attachPacketHandlers } from "./packets";
import { handleDisconnect } from "./disconnection";
import handlers from "./handlers";

let instance: SocketServer | null = null;

export async function createSocketServer(httpServer: HTTPServer) {
    const server = new SocketServer(httpServer, {
        path: "/api/socket",
        transports: ["websocket"],
        adapter: createAdapter(
            getRedisClient(),
            getRedisClient().duplicate()
        ),
        cors: {
            origin: [
                process.env.PUBLIC_ORIGIN,
                process.env.PUBLIC_DEV_ORIGIN
            ].filter(origin => origin != undefined)
        }
    });

    server.on("connect", socket => {
        attachPacketHandlers(socket, handlers, packetMiddleware);

        socket.on("disconnect", () => handleDisconnect(server, socket));
    });

    server.on(playerDeathEvent, async (userId: string) => {
        const socket = await getPlayerSocket(userId, true);
        if (!socket) return;

        (socket.data as SocketIdentity).dead = true;
    });

    return instance = server;
}

export function getSocketServer() {
    if (!instance) throw new Error(
        "socket server referenced before creation."
    );

    return instance;
}