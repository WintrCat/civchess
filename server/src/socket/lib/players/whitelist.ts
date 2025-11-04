import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { SocketOrUserId, getUserId } from "@/socket/lib/players";

type Whitelist = NonNullable<World["whitelistedPlayers"]>;

const whitelistPath = "$.whitelistedPlayers";

export async function whitelistPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    await getRedisClient().json.set(
        worldCode,
        `${whitelistPath}.${getUserId(socketOrUserId)}`,
        true
    );
}

export async function unwhitelistPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    await getRedisClient().json.delete(
        worldCode,
        `${whitelistPath}.${getUserId(socketOrUserId)}`
    );
}

export async function getWhitelist(worldCode: string) {
    const whitelist = await getRedisClient().json
        .get<Whitelist>(worldCode, whitelistPath);

    return whitelist && Object.keys(whitelist);
}

export async function isWhitelistActive(worldCode: string) {
    return await getRedisClient().json
        .exists(worldCode, whitelistPath);
}

export async function isPlayerWhitelisted(worldCode: string, userId: string) {
    return await getRedisClient().json
        .exists(worldCode, `${whitelistPath}.${userId}`);
}