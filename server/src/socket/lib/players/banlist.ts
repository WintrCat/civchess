import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { SocketOrUserId, getUserId, kickPlayer } from "@/socket/lib/players";

const banlistPath = "$.bannedPlayers";

export async function banPlayer(
    worldCode: string,
    socketOrUserId: SocketOrUserId
) {
    if (typeof socketOrUserId == "string")
        return await getRedisClient().json.set(
            worldCode, `${banlistPath}.${socketOrUserId}`, true
        );

    const userId = getUserId(socketOrUserId);

    await getRedisClient().json.set(
        worldCode, `${banlistPath}.${userId}`, true
    );

    kickPlayer(socketOrUserId,
        "You have been banned from this world.",
        "Banned from the world"
    );
}

export async function unbanPlayer(worldCode: string, userId: string) {
    await getRedisClient().json.delete(
        worldCode, `${banlistPath}.${userId}`
    );
}

export async function getBannedPlayers(worldCode: string) {
    const banlist = await getRedisClient().json
        .get<World["bannedPlayers"]>(worldCode, banlistPath);

    return banlist ? Object.keys(banlist) : [];
}

export async function isPlayerBanned(worldCode: string, userId: string) {
    return await getRedisClient().json.exists(
        worldCode, `${banlistPath}.${userId}`
    );
}