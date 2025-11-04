import { BroadcastOperator, RemoteSocket, Socket } from "socket.io";

import { World } from "shared/types/world/World";
import { Player } from "shared/types/world/Player";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { getSocketServer } from "@/socket";
import { sendPacket } from "@/socket/packets";

type ManageableSocket = Socket | RemoteSocket<{}, {}>;

export type SocketOrUserId = ManageableSocket | string;

export function getUserId(socketOrUserId: SocketOrUserId) {
    return typeof socketOrUserId == "string"
        ? socketOrUserId
        : (socketOrUserId.data as SocketIdentity).profile.userId;
}

export function getPlayerPath(userId?: string) {
    return userId ? `$.players.${userId}` : "$.players";
}

export async function getPlayer(worldCode: string, userId: string) {
    return await getRedisClient().json.get<Player>(
        worldCode, getPlayerPath(userId)
    );
}

export async function getPlayers(worldCode: string) {
    return await getRedisClient().json.get<World["players"]>(
        worldCode, getPlayerPath()
    );
}

export function getPlayerSocket(userId: string) {
    return getSocketServer().in(userId);
}

export function kickPlayer(
    socket: ManageableSocket | BroadcastOperator<{}, {}>,
    reason: string,
    title?: string
) {
    sendPacket("playerKick", {
        reason, title: title || "Kicked from the world"
    }, socket);

    if ("disconnectSockets" in socket) {
        socket.disconnectSockets();
    } else {
        socket.disconnect();
    }
}