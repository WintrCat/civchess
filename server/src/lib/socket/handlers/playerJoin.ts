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

        // Check the validity of the session token. if invalid, reject the packet
        const session = await Session.findOne({ token: sessionToken }).lean();

        if (!session) return rejectJoin(socket, "Invalid Session.");

        // ACCESS TO: User object - Fetch the user from the userId in the session
        const user = await User.findById(
            new Types.ObjectId(session.userId)
        ).lean();

        if (!user) return rejectJoin(socket, "Invalid Session.");

        // If world code doesn't exist or isn't online, reject join
        if (!await isWorldOnline(worldCode)) {
            const offlineWorldExists = await worldExists({ code: worldCode });

            return rejectJoin(socket, offlineWorldExists
                ? "This world is currently offline, please try again later"
                : "A world with this world code does not exist."
            );
        }

        // ACCESS TO: banlist and whitelist of online world. Fetch those.
        // If the player is banned or the whitelist exists and player is not in it, reject
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

        // If the world is full, reject join
        const connectedSockets = await socket.in(worldCode).fetchSockets();

        const maxPlayers = await getOnlineWorld<number>(
            worldCode, "$.maxPlayers"
        ) || Infinity;

        if (connectedSockets.length >= maxPlayers)
            return rejectJoin(socket, "This world is currently full.");

        // Add the socket to a room with the same name as world code
        socket.join(worldCode);

        // Add the socket identity (session token, user ID, world code, expiration timestamp)
        // to the socket client
        const socketIdentity: SocketIdentity = {
            userId: user.id,
            sessionToken: sessionToken,
            sessionExpiresAt: Date.now() + (1000 * 60 * 10), // 10 mins,
            worldCode: worldCode,
            profile: toPublicProfile(user)
        };

        socket.data = socketIdentity;

        // Is this user ID already connected to server? If so, kick existing socket
        remove(connectedSockets, connSocket => {
            const identity = connSocket.data as SocketIdentity;

            if (identity.userId == user.id) {
                connSocket.disconnect();
                return true;
            }

            return false;
        });

        // If the player has never played before, find a random spawn location
        // and create a player object for them in world.players
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