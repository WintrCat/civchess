import { Socket, Server as SocketServer } from "socket.io";
import { SocketIdentity } from "@/types/SocketIdentity";

export async function setChunkSubscription(
    socket: Socket,
    x: number,
    y: number,
    subscribed: boolean
) {
    const identity = socket.data as SocketIdentity;
    const subRoom = `${identity.worldCode}:chunk-${x}-${y}`;

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
    if (socket instanceof SocketServer)
        return socket.to(`${worldCode}:chunk-${x}-${y}`);

    return socket.broadcast.to(`${worldCode}:chunk-${x}-${y}`);
}