import { cloneDeep } from "es-toolkit";

import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { fetchWorld, toBaseWorld } from "./fetch";
import { OnlineChunk, OnlineWorld } from "@/types/OnlineWorld";

export async function isWorldOnline(worldCode: string) {
    const matchCount = await getRedisClient().exists(worldCode);

    return matchCount > 0;
}

/**
 * @description Will throw an error if the world is already online,
 * or if the given world code doesn't exist.
 */
export async function hostWorld(world: World | string) {
    if (typeof world == "string") {
        const userWorld = await fetchWorld({ code: world });
        if (!userWorld) throw new Error();

        world = toBaseWorld(userWorld);
    }

    if (await isWorldOnline(world.code)) throw new Error();

    // Convert to online world (add chunk subscribers)
    const worldChunks = cloneDeep(world.chunks) as OnlineChunk[][];

    for (const row of worldChunks) {
        for (const chunk of row) {
            chunk.subscribers = {};
        }
    }

    const onlineWorld: OnlineWorld = { ...world, chunks: worldChunks };

    await getRedisClient().json.set(world.code, "$", onlineWorld);
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    const world = await getRedisClient().json.get<World>(worldCode, "$");
    if (!world) return false;

    await UserWorld.updateOne({ code: world.code }, world);

    await getRedisClient().del(worldCode);

    return true;
}