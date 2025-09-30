import { Socket } from "socket.io";
import { Types } from "mongoose";
import { remove, random } from "es-toolkit";

import { Player } from "shared/types/world/Player";
import { getChunkCoordinates } from "shared/lib/world-chunks";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { Session, User } from "@/database/models/account";
import { isWorldOnline } from "@/lib/worlds/server";
import { worldExists } from "@/lib/worlds/fetch";
import { toPublicProfile } from "@/lib/public-profile";
import {
    getMaxPlayers,
    kickPlayer,
    isPlayerBanned,
    isWhitelistActive,
    isPlayerWhitelisted
} from "../lib/manage-players";
import {
    getChunkBroadcaster,
    getSurroundingChunks,
    setChunkSubscription
} from "../lib/world-chunks";
import { createPacketHandler, sendPacket } from "../packets";

function rejectJoin(socket: Socket, reason: string) {
    kickPlayer(socket, reason, "Failed to join world");
}

export const playerJoinHandler = createPacketHandler({
    type: "playerJoin",
    handle: async ({ sessionToken, worldCode }, socket) => {
        // Validate session token and get corresponding user ID
        const session = await Session.findOne({ token: sessionToken }).lean();
        if (!session) return rejectJoin(socket, "Invalid Session.");

        const user = await User.findById(
            new Types.ObjectId(session.userId)
        ).lean();
        if (!user) return rejectJoin(socket, "Invalid Session.");

        const userId = user._id.toString();

        // Ensure world exists and is online
        if (!await isWorldOnline(worldCode)) {
            const offlineWorldExists = await worldExists({ code: worldCode });

            return rejectJoin(socket, offlineWorldExists
                ? "This world is currently offline, please try again later."
                : "A world with this world code does not exist."
            );
        }

        // Ensure player is not banned from the world
        if (await isPlayerBanned(worldCode, userId))
            return rejectJoin(socket, "You are banned from this world.");

        // Enforce world whitelist if applicable
        if (
            await isWhitelistActive(worldCode)
            && !await isPlayerWhitelisted(worldCode, userId)
        ) return rejectJoin(socket, "You are not whitelisted!");

        // Ensure the world is not full (reached its max player count)
        const connectedSockets = await socket.in(worldCode).fetchSockets();

        if (connectedSockets.length >= await getMaxPlayers(worldCode))
            return rejectJoin(socket, "This world is currently full.");

        // Add the socket to the world code room & create its identity
        socket.join(worldCode);

        const socketIdentity: SocketIdentity = {
            userId: userId,
            sessionToken: sessionToken,
            sessionExpiresAt: Date.now() + (1000 * 60 * 10), // 10 mins
            worldCode: worldCode,
            profile: toPublicProfile(user)
        };

        socket.data = socketIdentity;

        // Terminate any open socket with the same user ID as the joiner
        remove(connectedSockets, connSocket => {
            const identity = connSocket.data as SocketIdentity;

            if (identity.userId == userId) {
                kickPlayer(connSocket,
                    "You logged in from another location."
                );
                
                return true;
            }

            return false;
        });

        // Create player data or fetch existing from the world server
        let playerData = await getRedisClient().json.get<Player>(
            worldCode, `$.players.${userId}`
        );

        if (!playerData) {
            const createdPlayerData: Player = {
                x: 0,
                y: 0,
                colour: "#" + random(0, 0xffffff).toString(16),
                inventory: []
            };
            
            await getRedisClient().json.set(
                worldCode, `$.players.${userId}`, createdPlayerData
            );

            playerData = createdPlayerData;
        }

        // Move player if spawn location is now obstructed
        // getNearestSpawnLocation(worldCode, x, y);

        // Return a server information packet with playerlist
        sendPacket(socket, "serverInformation", {
            localPlayer: playerData,
            players: connectedSockets
                .map(socket => (socket.data as SocketIdentity).profile)
                .concat(socketIdentity.profile),
            worldChunkSize: await getRedisClient().json
                .length(worldCode, "$.chunks")
        });

        // Subscribe player to and send surrounding chunks
        const surroundingChunks = getSurroundingChunks(
            worldCode, playerData.x, playerData.y
        );

        for await (const chunkData of surroundingChunks) {
            setChunkSubscription(socket,
                worldCode, chunkData.x, chunkData.y, true
            );

            sendPacket(socket, "worldChunk", chunkData);
        }

        // Broadcast join to others
        sendPacket(socket, "playerJoin", socketIdentity.profile,
            sender => sender.broadcast.to(worldCode)
        );

        // Broadcast spawn to those subscribed to spawn chunk
        const spawnChunkLocation = getChunkCoordinates(
            playerData.x, playerData.y
        );

        sendPacket(socket, "playerSpawn", {
            username: socketIdentity.profile.name,
            x: playerData.x,
            y: playerData.y,
            colour: playerData.colour
        }, sender => getChunkBroadcaster(
            sender, worldCode,
            spawnChunkLocation.x, spawnChunkLocation.y
        ));
    }
});