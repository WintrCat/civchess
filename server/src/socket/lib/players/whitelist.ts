import { getRedisClient } from "@/database/redis";
import { SocketOrUserId, RecordSet, getUserId } from "@/socket/lib/players";

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