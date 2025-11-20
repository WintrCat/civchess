import { Socket, Server as SocketServer } from "socket.io";

import { SocketIdentity } from "@/types/SocketIdentity";

export function chunkSubscriptionRoom(
    worldCode: string,
    x: number,
    y: number
) {
    return `${worldCode}:chunk-${x}-${y}`;
}

export function setChunkSubscription(
    socket: Socket,
    x: number,
    y: number,
    subscribed: boolean
) {
    const id = socket.data as SocketIdentity;
    const subRoom = chunkSubscriptionRoom(id.worldCode, x, y);

    if (subscribed) {
        socket.join(subRoom);
    } else {
        socket.leave(subRoom);
    }
}

export function clearChunkSubscriptions(socket: Socket) {
    const id = socket.data as SocketIdentity;

    socket.rooms.values()
        .filter(room => room.startsWith(`${id.worldCode}:chunk`))
        .forEach(room => socket.leave(room));
}

export function getChunkBroadcaster(
    socket: Socket | SocketServer,
    worldCode: string,
    x: number,
    y: number
) {
    const subRoom = chunkSubscriptionRoom(worldCode, x, y);

    return socket instanceof SocketServer
        ? socket.to(subRoom)
        : socket.broadcast.to(subRoom);
}