import { Socket } from "socket.io";
import { Types } from "mongoose";
import { randomInt } from "es-toolkit";

import { chunkSquareCount, getChunkCoordinates, coordinateIndex } from "shared/lib/world-chunks";
import { isIdentified, SocketIdentity } from "@/types/SocketIdentity";
import { Session } from "@/database/models/account";
import { config } from "@/lib/config";
import { isWorldOnline } from "@/lib/worlds/server";
import { worldExists } from "@/lib/worlds/fetch";
import { getPublicProfile } from "@/lib/public-profile";
import { getSocketServer } from "@/socket";
import { getWorldChunkSize, } from "../lib/chunks";
import { setSquarePiece, getSquare } from "../lib/chunks/squares";
import { getChunkBroadcaster } from "../lib/chunks/subscribers";
import { getPlayer, kickPlayer } from "../lib/players";
import { isWhitelistActive, isPlayerWhitelisted } from "../lib/players/whitelist";
import { isPlayerBanned } from "../lib/players/banlist";
import {
    incrementPlayerCount,
    getPlayerCount,
    getMaxPlayers
} from "../lib/players/count";
import { spawnPlayer } from "../lib/players/spawn";
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

        const profile = await getPublicProfile({
            _id: new Types.ObjectId(session.userId)
        });
        if (!profile) return rejectJoin(socket, "Invalid Session.");

        // Ensure world exists and is online
        if (!await isWorldOnline(worldCode)) {
            const offlineWorldExists = await worldExists({ code: worldCode });

            return rejectJoin(socket, offlineWorldExists
                ? "This world is currently offline, please try again later."
                : "A world with this world code does not exist."
            );
        }

        // Ensure player is not banned from the world
        if (await isPlayerBanned(worldCode, profile.userId))
            return rejectJoin(socket, "You are banned from this world.");

        // Enforce world whitelist if applicable
        if (
            await isWhitelistActive(worldCode)
            && !await isPlayerWhitelisted(worldCode, profile.userId)
        ) return rejectJoin(socket, "You are not whitelisted!");

        // Ensure the world is not full (reached its max player count)
        if (await getPlayerCount(worldCode) >= await getMaxPlayers(worldCode))
            return rejectJoin(socket, "This world is currently full.");

        // Assign an initial identity before attempting to kick
        // other sockets so the disconnect handler can perform
        // the proper cleanup when they are disconnected.
        socket.data = {
            sessionToken: sessionToken,
            sessionExpiresAt: Date.now() + (1000 * 60 * 10), // 10 mins
            worldCode: worldCode,
            profile: profile,
            dead: false
        } satisfies SocketIdentity;

        // Terminate any open sockets for the same user ID (except this one)
        const server = getSocketServer();
        const userSockets = await server.in(profile.userId).fetchSockets();
        for (const s of userSockets) {
            if (s.id === socket.id) continue;
            kickPlayer(s, "You logged in from another location.");
        }

        // Fetch player data from world or create new player data
        const worldChunkSize = await getWorldChunkSize(worldCode);

        const playerData = await getPlayer(
            worldCode, profile.userId
        ) || {
            userId: profile.userId,
            x: randomInt(0, worldChunkSize * chunkSquareCount),
            y: randomInt(0, worldChunkSize * chunkSquareCount),
            colour: "#" + randomInt(0, 0xffffff).toString(16).padStart(6, '0'), // Random hex color with zero-padding for valid CSS
            health: config.maxPlayerHealth,
            inventory: []
        };

        // Clean up any pre-existing runtime piece for the joining user
        // This ensures no ghost pieces remain from previous sessions
        const existingSquare = await getSquare(
            worldCode, playerData.x, playerData.y, "runtime"
        );

        if (existingSquare?.id === "player" && existingSquare.userId === profile.userId) {
            await setSquarePiece(worldCode, playerData.x, playerData.y, undefined, "runtime");

            const { chunkX, chunkY, relativeX, relativeY } = (
                getChunkCoordinates(playerData.x, playerData.y)
            );

            sendPacket("worldChunkUpdate", {
                x: chunkX,
                y: chunkY,
                runtimeChanges: {
                    [coordinateIndex(relativeX, relativeY)]: null
                }
            }, getChunkBroadcaster(socket, worldCode, chunkX, chunkY));
        }

        // Add the socket to the world code room & update identity
        await socket.join([ worldCode, profile.userId ]);
        await incrementPlayerCount(worldCode);

        // Update dead flag based on persisted player data
        (socket.data as SocketIdentity).dead = playerData.health <= 0;

        // Return information about the world server
        const connectedSockets = await getSocketServer()
            .in(worldCode).fetchSockets();

        sendPacket("serverInformation", {
            players: Iterator.from(connectedSockets)
                .filter(socket => isIdentified(socket.data))
                .map(socket => (socket.data as SocketIdentity).profile)
                .toArray(),
            worldChunkSize: worldChunkSize,
            renderDistance: config.renderDistance
        }, socket);

        // Broadcast join to others
        sendPacket("playerJoin", profile,
            socket.broadcast.to(worldCode)
        );

        // Spawn player piece into the world
        await spawnPlayer(socket, playerData, worldChunkSize);
    }
});