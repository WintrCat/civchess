import { World } from "shared/types/game/World";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { OnlineWorld } from "@/types/OnlineWorld";
import { fetchWorld, toBaseWorld } from "./fetch";

export async function isWorldOnline(worldCode: string) {
    const matchCount = await getRedisClient().exists(`world:${worldCode}`);

    return matchCount > 0;
}

export async function getOnlineWorld(worldCode: string) {
    const worldString = await getRedisClient().get(`world:${worldCode}`);

    return worldString && JSON.parse(worldString) as OnlineWorld;
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

    await getRedisClient().set(`world:${world.code}`, JSON.stringify({
        ...world, connectedPlayers: []
    } satisfies OnlineWorld));
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    const onlineWorld = await getOnlineWorld(worldCode);
    if (!onlineWorld) return false;

    await UserWorld.updateOne(
        { code: onlineWorld.code },
        toBaseWorld(onlineWorld)
    );

    await getRedisClient().del(`world:${worldCode}`);

    return true;
}