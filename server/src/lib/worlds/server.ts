import { World } from "shared/types/world/World";
import { OnlineWorld } from "shared/types/world/OnlineWorld";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { fetchWorld, toBaseWorld } from "./fetch";
import { getSocketServer } from "@/socket";
import { kickPlayer } from "@/socket/lib/players";

export async function isWorldOnline(worldCode: string) {
    const matchCount = await getRedisClient().exists(worldCode);

    return matchCount > 0;
}

export function playerCountKey(worldCode: string) {
    return `${worldCode}:socket-count`;
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

    const onlineWorld: OnlineWorld = {
        ...world, runtimeChunks: {}
    };

    await getRedisClient().json.set(world.code, "$", onlineWorld);
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    if (!await getRedisClient().json.exists(worldCode, "$"))
        return false;

    // Kick all connected players
    kickPlayer(getSocketServer().in(worldCode),
        "The world has been shut down."
    );

    // Save world to database
    const world = await getRedisClient().json
        .get<OnlineWorld>(worldCode, "$");
        
    if (!world) return false;

    await UserWorld.updateOne({ code: world.code }, toBaseWorld(world));

    // Delete world's Redis keys
    await getRedisClient().del(worldCode);
    await getRedisClient().del(playerCountKey(worldCode));

    return true;
}