import { Socket } from "socket.io";

import { ServerboundPacketType } from "shared/types/packets/PacketType";
import { SocketIdentity } from "@/types/SocketIdentity";
import { Session } from "@/database/models/account";
import { kickPlayer } from "./lib/manage-players";

export function attachPacketMiddleware(socket: Socket) {
    socket.onAny(async (eventName: ServerboundPacketType) => {
        if (eventName == "playerJoin") return;
    
        const identity = socket.data as SocketIdentity | undefined;
        if (!identity) return;
        if (Date.now() < identity.sessionExpiresAt) return;

        const session = await Session.exists({
            token: identity.sessionToken
        });
        if (session) return;

        kickPlayer(socket, "Invalid Session.");

        socket.disconnect();
    });
}