import { Server as HTTPServer } from "http";
import { Server as SocketServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";

import { getRedisClient } from "@/database/redis";

let instance: SocketServer;

export function createSocketServer(httpServer: HTTPServer) {
    return instance = new SocketServer(httpServer, {
        path: "/api/socket",
        adapter: createAdapter(
            getRedisClient(),
            getRedisClient().duplicate()
        ),
        cors: {
            origin: [process.env.ORIGIN, process.env.VITE_DEV_ORIGIN]
                .filter(origin => origin != undefined)
        }
    });
}

export function getSocketServer() {
    return instance;
}