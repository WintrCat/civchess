import { Socket } from "socket.io";
import { Types } from "mongoose";
import { remove } from "es-toolkit";

import { Player } from "shared/types/world/Player";
import {
    editOnlineWorld,
    getOnlineWorld,
    isWorldOnline
} from "@/lib/worlds/server";
import { worldExists } from "@/lib/worlds/fetch";
import { toPublicProfile } from "@/lib/public-profile";
import { Session, User } from "@/database/models/account";
import { SocketIdentity } from "@/types/SocketIdentity";
import { createPacketHandler, sendPacket } from "../packets";

function rejectJoin(socket: Socket, reason: string) {
    sendPacket(socket, "playerJoinRejection", { reason });
    socket.disconnect();
}

export const playerJoinHandler = createPacketHandler(
    "playerJoin",
    async ({ sessionToken, worldCode }, socket) => {
        console.log("player join packet received!");

        // Validate session token and get corresponding user
        const session = await Session.findOne({ token: sessionToken }).lean();

        if (!session) return rejectJoin(socket, "Invalid Session.");

        const user = await User.findById(
            new Types.ObjectId(session.userId)
        ).lean();

        if (!user) return rejectJoin(socket, "Invalid Session.");

        // Ensure world exists and is online
        if (!await isWorldOnline(worldCode)) {
            const offlineWorldExists = await worldExists({ code: worldCode });

            return rejectJoin(socket, offlineWorldExists
                ? "This world is currently offline, please try again later"
                : "A world with this world code does not exist."
            );
        }

        // Enforce banned and whitelisted players lists
        const banlist = await getOnlineWorld<string[]>(
            worldCode, "$.bannedPlayers"
        ) || [];

        if (banlist.includes(user.id))
            return rejectJoin(socket, "You are banned from this world.");

        const whitelist = await getOnlineWorld<string[]>(
            worldCode, "$.whitelistedPlayers"
        );

        if (whitelist && !whitelist.includes(user.id))
            return rejectJoin(socket, "You are not on this world's whitelist.");

        // Ensure the world is not full (reached its max player count)
        const connectedSockets = await socket.in(worldCode).fetchSockets();

        const maxPlayers = await getOnlineWorld<number>(
            worldCode, "$.maxPlayers"
        ) || Infinity;

        if (connectedSockets.length >= maxPlayers)
            return rejectJoin(socket, "This world is currently full.");

        // Add the socket to the world code room & create its identity
        socket.join(worldCode);

        const socketIdentity: SocketIdentity = {
            userId: user.id,
            sessionToken: sessionToken,
            sessionExpiresAt: Date.now() + (1000 * 60 * 10), // 10 mins,
            worldCode: worldCode,
            profile: toPublicProfile(user)
        };

        socket.data = socketIdentity;

        // Terminate any open socket with the same user ID as the joiner
        remove(connectedSockets, connSocket => {
            const identity = connSocket.data as SocketIdentity;

            if (identity.userId == user.id) {
                connSocket.disconnect();
                return true;
            }

            return false;
        });

        // Create player data or fetch existing from the world server
        let playerData = await getOnlineWorld<Player>(
            worldCode, `$.players.${user.id}`
        );

        if (!playerData) {
            // If the spawn location has been obstructed (block etc.), BFS to find
            // nearest legal spawn location
            const createdPlayerData: Player = {
                x: 0, y: 0, inventory: []
            };

            await editOnlineWorld(
                worldCode,
                `$.players.${user.id}`,
                createdPlayerData
            );

            playerData = createdPlayerData;
        }

        // Return a server information packet with playerlist
        sendPacket(socket, "serverInformation", {
            players: connectedSockets
                .map(socket => (socket.data as SocketIdentity).profile)
                .concat(socketIdentity.profile)
        });

        // Return chunk packets that surround the player's location
    }
);