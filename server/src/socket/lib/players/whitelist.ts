import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { SocketOrUserId, getUserId } from "@/socket/lib/players";

type Whitelist = NonNullable<World["whitelistedPlayers"]>;

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
    const whitelist = await getRedisClient().json
        .get<Whitelist>(worldCode, "$.whitelistedPlayers");

    return whitelist && Object.keys(whitelist);
}

export async function isWhitelistActive(worldCode: string) {
    return await getRedisClient().json.exists(
        worldCode, "$.whitelistedPlayers"
    );
}

export async function isPlayerWhitelisted(worldCode: string, userId: string) {
    return await getRedisClient().json.exists(
        worldCode, `$.whitelistedPlayers.${userId}`
    );
}