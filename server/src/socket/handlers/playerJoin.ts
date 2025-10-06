import { Socket } from "socket.io";
import { Types } from "mongoose";
import { randomInt } from "es-toolkit";

import { PieceType } from "shared/constants/PieceType";
import { chunkSquareCount } from "shared/lib/world-chunks";
import { SocketIdentity } from "@/types/SocketIdentity";
import { getRedisClient } from "@/database/redis";
import { Session } from "@/database/models/account";
import { isWorldOnline } from "@/lib/worlds/server";
import { worldExists } from "@/lib/worlds/fetch";
import { getPublicProfile } from "@/lib/public-profile";
import { getSocketServer } from "@/socket";
import {
    getSurroundingChunks,
    getWorldChunkSize,
    setChunkSubscription,
    setSquarePiece
} from "../lib/world-chunks";
import { findNearestEmptySquare } from "../lib/empty-square";
import { getPlayer, kickPlayer } from "../lib/players";
import { isWhitelistActive, isPlayerWhitelisted } from "../lib/players/whitelist";
import { isPlayerBanned } from "../lib/players/banlist";
import {
    incrementPlayerCount,
    getPlayerCount,
    getMaxPlayers
} from "../lib/players/count";
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

        // Terminate any open socket with the same user ID as the joiner
        kickPlayer(socket.in(profile.userId),
            "You logged in from another location."
        );

        // Add the socket to the world code room & create its identity
        await socket.join([ worldCode, profile.userId ]);
        await incrementPlayerCount(worldCode);

        socket.data = {
            sessionToken: sessionToken,
            sessionExpiresAt: Date.now() + (1000 * 60 * 10), // 10 mins
            worldCode: worldCode,
            profile: profile
        } satisfies SocketIdentity;

        // Fetch player data from world or create new player data
        const worldChunkSize = await getWorldChunkSize(worldCode);

        const playerData = await getPlayer(
            worldCode, profile.userId
        ) || {
            x: randomInt(0, worldChunkSize * chunkSquareCount),
            y: randomInt(0, worldChunkSize * chunkSquareCount),
            colour: "#" + randomInt(0, 0xffffff).toString(16),
            inventory: []
        };

        // Move player if spawn location is obstructed
        const spawnLocation = await findNearestEmptySquare(
            worldCode, playerData.x, playerData.y
        );

        if (spawnLocation) {
            playerData.x = spawnLocation.x;
            playerData.y = spawnLocation.y;
        }

        // Register player data in world
        await getRedisClient().json.set(worldCode,
            `$.players.${profile.userId}`, playerData
        );

        // Put player piece on to spawn square
        await setSquarePiece(worldCode, playerData.x, playerData.y, {
            id: PieceType.PLAYER,
            userId: profile.userId,
            username: profile.name,
            colour: playerData.colour,
            health: 3
        }, "runtime");

        // Return a server information packet with playerlist
        const connectedSockets = await getSocketServer()
            .in(worldCode).fetchSockets();

        sendPacket(socket, "serverInformation", {
            localPlayer: playerData,
            players: connectedSockets.map(
                socket => (socket.data as SocketIdentity).profile
            ),
            worldChunkSize: worldChunkSize
        });

        // Subscribe player to and send surrounding chunks
        const surroundingChunks = getSurroundingChunks(
            worldCode, playerData.x, playerData.y
        );

        for await (const chunkData of surroundingChunks) {
            await setChunkSubscription(socket,
                chunkData.x, chunkData.y, true
            );

            sendPacket(socket, "worldChunkLoad", chunkData);
        }

        // Broadcast join to others
        sendPacket(socket, "playerJoin", profile,
            sender => sender.broadcast.to(worldCode)
        );
    }
});