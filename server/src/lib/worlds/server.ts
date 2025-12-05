import { World } from "shared/types/world/World";
import { OnlineWorld } from "shared/types/world/OnlineWorld";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { UserWorld } from "@/database/models/UserWorld";
import { getSocketServer } from "@/socket";
import { kickPlayer } from "@/socket/lib/players";
import { fetchWorld, toBaseWorld } from "./fetch";
import { autosaveLockKey, scheduleAutosaver } from "./autosave";

export const worldShutdownEvent = "worldShutdown";

export function playerCountKey(worldCode: string) {
    return `${worldCode}:socket-count`;
}

export function worldChunkSizeKey(worldCode: string) {
    return `${worldCode}:world-chunk-size`;
}

export async function isWorldOnline(worldCode: string) {
    return await getRedisClient().json.exists(worldCode, "$");
}

function emitWorldStatusUpdate(worldCode: string, online: boolean) {
    getSocketServer().of("/world-status").emit(
        "status", worldCode, online
    );
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
    scheduleAutosaver(world.code, true);

    if (world.pinned) emitWorldStatusUpdate(world.code, true);
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
        kickPlayer(socket, "The world has been shut down.");
    }
}

/**
 * @description Returns `false` if a world with the given code couldn't
 * be found.
 */
export async function shutdownWorld(worldCode: string) {
    if (!await isWorldOnline(worldCode)) return false;

    await saveWorld(worldCode);

    const pinned = await getRedisClient().json
        .get<boolean>(worldCode, "$.pinned");

    // Delete world's Redis keys
    const deletion = getRedisClient().createTransaction();

    deletion.del(worldCode);
    deletion.del(playerCountKey(worldCode));
    deletion.del(worldChunkSizeKey(worldCode));
    deletion.del(autosaveLockKey(worldCode));

    await deletion.exec();

    // Queue local sockets for shutdown, dispatch shutdown event
    await shutdownLocalSockets(worldCode);
    getSocketServer().serverSideEmit(worldShutdownEvent, worldCode);

    scheduleAutosaver(worldCode, false);

    // Emit offline world status update to lobby pages
    if (pinned) emitWorldStatusUpdate(worldCode, false);

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