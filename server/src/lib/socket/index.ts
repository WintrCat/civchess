import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { getRedisClient } from "@/database/redis";
import { attachPacketHandlers } from "./packets";
import handlers from "./handlers";

let instance: SocketServer;

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

    server.on("connection", socket => (
        attachPacketHandlers(socket, handlers)
    ));

    return instance = server;
}

export function getSocketServer() {
    return instance;
}