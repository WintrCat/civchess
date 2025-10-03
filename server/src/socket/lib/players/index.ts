import { BroadcastOperator, RemoteSocket, Socket } from "socket.io";

import { Player } from "shared/types/world/Player";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { sendPacket } from "@/socket/packets";

type ManageableSocket = Socket | RemoteSocket<{}, {}>;

export type SocketOrUserId = ManageableSocket | string;

export function getUserId(socketOrUserId: SocketOrUserId) {
    return typeof socketOrUserId == "string"
        ? socketOrUserId
        : (socketOrUserId.data as SocketIdentity).profile.userId;
}

export async function getPlayer(worldCode: string, userId: string) {
    return await getRedisClient().json.get<Player>(
        worldCode, `$.players.${userId}`
    );
}

export function kickPlayer(
    socket: ManageableSocket | BroadcastOperator<{}, {}>,
    reason: string,
    title?: string
) {
    sendPacket(socket, "playerKick", {
        reason, title: title || "Kicked from the world"
    });

    if ("disconnectSockets" in socket) {
        socket.disconnectSockets();
    } else {
        socket.disconnect();
    }
}