import { Socket } from "socket.io";

import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { sendPacket } from "../packets";

function getUserId(socketOrUserId: Socket | string) {
    return typeof socketOrUserId == "string"
        ? socketOrUserId
        : (socketOrUserId.data as SocketIdentity).userId;
}

export function kickPlayer(
    socket: Socket,
    reason: string,
    title?: string
) {
    sendPacket(socket, "playerKick", {
        reason, title: title || "Kicked from the world"
    });

    socket.disconnect();
}

export async function banPlayer(
    socket: Socket,
    reason: string,
    title?: string
) {
    const identity = socket.data as SocketIdentity;

    await getRedisClient().json.push(
        identity.worldCode, "$.bannedPlayers", identity.userId
    );

    kickPlayer(socket, reason, title);
}

export const whitelist = {
    add: async (worldCode: string, socketOrUserId: Socket | string) => {
        await getRedisClient().json.push(
            worldCode, "$.whitelistedPlayers", getUserId(socketOrUserId), []
        );
    },

    remove: async (worldCode: string, socketOrUserId: Socket | string) => {
        await getRedisClient().json.remove(
            worldCode, "$.whitelistedPlayers", getUserId(socketOrUserId)
        );
    },
    
    fetch: async (worldCode: string) => {
        return await getRedisClient().json.get<string[]>(
            worldCode, "$.whitelistedPlayers"
        );
    }
};