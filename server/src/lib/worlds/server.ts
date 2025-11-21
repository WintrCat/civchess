import { World } from "shared/types/world/World";
import { OnlineWorld } from "shared/types/world/OnlineWorld";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { getSocketServer } from "@/socket";
import { SocketIdentity } from "@/types/SocketIdentity";
import { fetchWorld, toBaseWorld } from "./fetch";

export const worldShutdownEvent = "worldShutdown";

export function playerCountKey(worldCode: string) {
    return `${worldCode}:socket-count`;
}

export function worldChunkSizeKey(worldCode: string) {
    return `${worldCode}:world-chunk-size`;
}

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

    const onlineWorld: OnlineWorld = {
        ...world, runtimeChunks: {}
    };

    await getRedisClient().json.set(world.code, "$", onlineWorld);
}

/**
 * @description Queues local sockets for shutdown and kicks them,
 * preventing unnecessary despawning of pieces upon disconnection.
 */
export async function shutdownLocalSockets(worldCode: string) {
    const sockets = await getSocketServer().local
        .in(worldCode).fetchSockets();

    for (const socket of sockets) {
        (socket.data as SocketIdentity).shutdownQueued = true;
        socket.disconnect();
    }
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    if (!await getRedisClient().json.exists(worldCode, "$"))
        return false;

    // Delete world's Redis keys
    const deletion = getRedisClient().createTransaction();

    deletion.del(worldCode);
    deletion.del(playerCountKey(worldCode));
    deletion.del(worldChunkSizeKey(worldCode));

    await deletion.exec();

    // Queue local sockets for shutdown, dispatch shutdown event
    await shutdownLocalSockets(worldCode);
    getSocketServer().serverSideEmit(worldShutdownEvent, worldCode);

    // Save world to database
    await saveWorld(worldCode);

    return true;
}

/**
 * @returns Whether the world was online and saved successfully.
 */
export async function saveWorld(worldCode: string) {
    const world = await getRedisClient().json
        .get<OnlineWorld>(worldCode, "$");
        
    if (!world) return false;

    await UserWorld.updateOne(
        { code: world.code },
        toBaseWorld(world)
    );

    return true;
}