import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { fetchWorld, toBaseWorld } from "./fetch";

type ObjectValue = string | number | object;

export async function isWorldOnline(worldCode: string) {
    const matchCount = await getRedisClient().exists(worldCode);

    return matchCount > 0;
}

export async function getOnlineWorld<T extends ObjectValue = World>(
    worldCode: string,
    path = "$"
): Promise<T | null> {
    try {
        const world = JSON.parse(String(
            await getRedisClient().call("json.get", worldCode, path)
        ));
        if (!Array.isArray(world)) return null;

        return world.at(0) || null;
    } catch {
        return null;
    }
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

    await getRedisClient().call("json.set", world.code, "$",
        JSON.stringify(world)
    );
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    const onlineWorld = await getOnlineWorld(worldCode);
    if (!onlineWorld) return false;

    await UserWorld.updateOne({ code: onlineWorld.code }, onlineWorld);

    await getRedisClient().del(worldCode);

    return true;
}

/**
 * @description If a world is not found, this will silently fail unless
 * `onNotFound` is specified.
 */
export async function editOnlineWorld(
    worldCode: string,
    path: string,
    value: ObjectValue,
    onNotFound?: () => void
) {
    const worldOnline = await isWorldOnline(worldCode);
    if (!worldOnline) return onNotFound?.();

    await getRedisClient().call(
        "json.set",
        worldCode,
        path,
        JSON.stringify(value)
    );
}