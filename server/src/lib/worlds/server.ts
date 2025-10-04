import { World } from "shared/types/world/World";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { fetchWorld, toBaseWorld } from "./fetch";
import { getSocketServer } from "@/socket";
import { getPlayers, kickPlayer } from "@/socket/lib/players";
import { setSquarePiece } from "@/socket/lib/world-chunks";

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

    await getRedisClient().json.set(world.code, "$", world);
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

    // Remove all player pieces from world
    const players = await getPlayers(worldCode) || {};

    for (const userId in players) {
        const player = players[userId];
        await setSquarePiece(worldCode, player.x, player.y, undefined);
    }

    // Save world to database
    const world = await getRedisClient().json.get<World>(worldCode, "$");
    if (!world) return false;

    await UserWorld.updateOne({ code: world.code }, world);

    // Delete world's Redis keys
    await getRedisClient().del(worldCode);
    await getRedisClient().del(playerCountKey(worldCode));

    return true;
}