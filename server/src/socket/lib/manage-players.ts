import { Socket } from "socket.io";

import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { sendPacket } from "../packets";

type ManageableSocket = Pick<Socket, "emit" | "data"> & {
    disconnect: () => void;
};

type SocketOrUserId = ManageableSocket | string;

type RecordSet = Record<string, true>;

function getUserId(socketOrUserId: SocketOrUserId) {
    return typeof socketOrUserId == "string"
        ? socketOrUserId
        : (socketOrUserId.data as SocketIdentity).userId;
}

export async function getMaxPlayers(worldCode: string) {
    return await getRedisClient().json.get<number>(
        worldCode, "$.maxPlayers"
    ) || Infinity;
}

export function kickPlayer(
    socket: ManageableSocket,
    reason: string,
    title?: string
) {
    sendPacket(socket, "playerKick", {
        reason, title: title || "Kicked from the world"
    });

    socket.disconnect();
}

// Manage banlist
export async function banPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    if (typeof socketOrUserId == "string")
        return await getRedisClient().json.set(
            worldCode, `$.bannedPlayers.${socketOrUserId}`, true
        );

    const userId = getUserId(socketOrUserId);

    await getRedisClient().json.set(
        worldCode, `$.bannedPlayers.${userId}`, true
    );

    kickPlayer(socketOrUserId,
        "You have been banned from this world.",
        "Banned from the world"
    );
}

export async function unbanPlayer(worldCode: string, userId: string) {
    await getRedisClient().json.delete(
        worldCode, `$.bannedPlayers.${userId}`
    );
}

export async function getBannedPlayers(worldCode: string) {
    const banlist = await getRedisClient().json
        .get<RecordSet>(worldCode, "$.bannedPlayers");

    return banlist ? Object.keys(banlist) : [];
}

export async function isPlayerBanned(worldCode: string, userId: string) {
    const bannedPlayer = await getRedisClient().json
        .get<RecordSet[string]>(worldCode, `$.bannedPlayers.${userId}`);

    return !!bannedPlayer;
}

// Manage whitelist
export async function whitelistPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    await getRedisClient().json.set(
        worldCode,
        `$.whitelistedPlayers.${getUserId(socketOrUserId)}`,
        true
    );
}

export async function unwhitelistPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    await getRedisClient().json.delete(
        worldCode,
        `$.whitelistedPlayers.${getUserId(socketOrUserId)}`
    );
}

export async function getWhitelist(worldCode: string) {
    const whitelist = await getRedisClient().json.get<RecordSet>(
        worldCode, "$.whitelistedPlayers"
    );

    return whitelist && Object.keys(whitelist);
}

export async function isWhitelistActive(worldCode: string) {
    return await getRedisClient().json.exists(
        worldCode, "$.whitelistedPlayers"
    );
}

export async function isPlayerWhitelisted(worldCode: string, userId: string) {
    const whitelistedPlayer = await getRedisClient().json
        .get<RecordSet[string]>(worldCode, `$.whitelistedPlayers.${userId}`);

    return !!whitelistedPlayer;
}