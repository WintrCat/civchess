import { Socket } from "socket.io";

import { ServerboundPacketType } from "shared/types/packets/PacketType";
import { isIdentified } from "@/types/SocketIdentity";
import { Session } from "@/database/models/account";
import { kickPlayer } from "./lib/players";

export type PacketMiddleware = (
    socket: Socket,
    type: ServerboundPacketType,
    packet: object
) => void | Promise<void>;

export const packetMiddleware: PacketMiddleware = async (
    socket, type
) => {
    if (!isIdentified(socket.data)) {
        if (type != "playerJoin") throw new Error(
            "non player join packet sent without socket identity."
        );

        return;
    }
    
    const identity = socket.data;

    if (
        identity.dead
        && type != "playerJoin"
        && type != "playerRespawn"
    ) return;
    
    // Check if it is time to inspect session token
    if (Date.now() < identity.sessionExpiresAt) return;

    const session = await Session.exists({
        token: identity.sessionToken
    });

    if (!session) kickPlayer(socket, "Invalid Session.");
};