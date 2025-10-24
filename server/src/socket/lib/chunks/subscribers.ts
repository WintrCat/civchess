import { Socket, Server as SocketServer } from "socket.io";

import { SocketIdentity } from "@/types/SocketIdentity";

export function chunkSubscriptionRoom(
    worldCode: string,
    x: number,
    y: number
) {
    return `${worldCode}:chunk-${x}-${y}`;
}

export async function setChunkSubscription(
    socket: Socket,
    x: number,
    y: number,
    subscribed: boolean
) {
    const id = socket.data as SocketIdentity;
    const subRoom = chunkSubscriptionRoom(id.worldCode, x, y);

    if (subscribed) {
        await socket.join(subRoom);
    } else {
        await socket.leave(subRoom);
    }
}

export function getChunkBroadcaster(
    socket: Socket | SocketServer,
    worldCode: string,
    x: number,
    y: number
) {
    const subRoom = chunkSubscriptionRoom(worldCode, x, y);

    if (socket instanceof SocketServer)
        return socket.to(subRoom);

    return socket.broadcast.to(subRoom);
}