import { Socket } from "socket.io";

import { Player } from "shared/types/world/Player";
import { toPlayerPiece } from "shared/types/world/pieces/Player";
import { getChunkCoordinates, coordinateIndex } from "shared/lib/world-chunks";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { config } from "@/lib/config";
import { sendPacket } from "@/socket/packets";
import { getPlayerPath } from "@/socket/lib/players";
import { findNearestEmptySquare } from "../empty-square";
import { getSurroundingChunks, getWorldChunkSize } from "../chunks";
import { setSquarePiece } from "../chunks/squares";
import {
    clearChunkSubscriptions,
    getChunkBroadcaster,
    setChunkSubscription
} from "../chunks/subscribers";

/**
 * @description Spawns a player into the world. If the player is alive,
 * find a suitable spawn location nearest to the provided player data,
 * and place their piece on the map, broadcasting the spawn to others.
 * Load and send to them their new surrounding chunks.
 * @returns The final spawn location.
 */
export async function spawnPlayer(
    socket: Socket,
    playerData: Player,
    worldChunkSizeCache?: number
) {
    const id = socket.data as SocketIdentity;

    if (playerData.health > 0) {
        // Move player if spawn location is obstructed
        const spawnLocation = await findNearestEmptySquare(
            id.worldCode, playerData.x, playerData.y
        );

        if (spawnLocation) {
            playerData.x = spawnLocation.x;
            playerData.y = spawnLocation.y;
        }

        // Place player piece in the world
        const playerPiece = toPlayerPiece(playerData, id.profile.name);

        await setSquarePiece(id.worldCode,
            playerData.x, playerData.y, playerPiece, "runtime"
        );

        // Broadcast player spawn to chunk subscribers
        const { chunkX, chunkY, relativeX, relativeY } = (
            getChunkCoordinates(playerData.x, playerData.y)
        );

        sendPacket("worldChunkUpdate", {
            x: chunkX,
            y: chunkY,
            runtimeChanges: {
                [coordinateIndex(relativeX, relativeY)]: playerPiece
            }
        }, getChunkBroadcaster(
            socket, id.worldCode, chunkX, chunkY
        ));

        // Subscribe player to and send surrounding chunks
        clearChunkSubscriptions(socket);

        const surroundingChunks = getSurroundingChunks({
            worldCode: id.worldCode,
            worldChunkSize: worldChunkSizeCache
                || await getWorldChunkSize(id.worldCode),
            chunkX: chunkX,
            chunkY: chunkY
        });

        for await (const chunkData of surroundingChunks) {
            setChunkSubscription(socket, chunkData.x, chunkData.y, true);
            sendPacket("worldChunkLoad", chunkData, socket);
        }
    }

    // Register player data in world
    await getRedisClient().json.set(id.worldCode,
        getPlayerPath(id.profile.userId), playerData
    );

    // Return player information
    sendPacket("playerInformation", {
        ...playerData,
        maxHealth: config.maxPlayerHealth
    }, socket);

    return { x: playerData.x, y: playerData.y };
}