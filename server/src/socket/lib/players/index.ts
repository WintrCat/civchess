import { BroadcastOperator, RemoteSocket, Socket } from "socket.io";

import { World } from "shared/types/world/World";
import { Player } from "shared/types/world/Player";
import { SocketIdentity } from "@/types/SocketIdentity";
import { ExtendedCommander, getRedisClient, ObjectValue } from "@/database/redis";
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

export async function getPlayers(worldCode: string) {
    return await getRedisClient().json.get<World["players"]>(
        worldCode, "$.players"
    );
}

export async function updatePlayer(
    worldCode: string,
    userId: string,
    path: keyof Player,
    value: ObjectValue,
    commander?: ExtendedCommander
) {
    await (commander || getRedisClient()).json.set(
        worldCode, `$.players.${userId}.${path}`, value 
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