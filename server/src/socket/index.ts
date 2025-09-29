import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { attachPacketMiddleware } from "./middleware";
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
        attachPacketMiddleware(socket);
        attachPacketHandlers(socket, handlers);

        socket.on("disconnect", () => {
            if (!socket.data?.userId) return;

            const identity = socket.data as SocketIdentity;

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