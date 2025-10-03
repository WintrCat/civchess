import { getRedisClient } from "@/database/redis";
import { playerCountKey as countKey } from "@/lib/worlds/server";

export async function getPlayerCount(worldCode: string) {
    const socketCount = await getRedisClient().json
        .get<number>(countKey(worldCode), "$");

    return socketCount || 0;
}

export async function incrementPlayerCount(worldCode: string) {
    await getRedisClient().incr(countKey(worldCode));
}

export async function decrementPlayerCount(worldCode: string) {
    await getRedisClient().decr(countKey(worldCode));
}

export async function getMaxPlayers(worldCode: string) {
    return await getRedisClient().json.get<number>(
        worldCode, "$.maxPlayers"
    ) || Infinity;
}