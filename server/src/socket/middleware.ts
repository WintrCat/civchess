import { Socket } from "socket.io";

import { isIdentified, SocketIdentity } from "@/types/SocketIdentity";
import { Session } from "@/database/models/account";
import { kickPlayer } from "./lib/players";

export function attachPacketMiddleware(socket: Socket) {
    socket.onAny(async () => {
        if (!isIdentified(socket)) return;

        const identity = socket.data as SocketIdentity;
        
        if (Date.now() < identity.sessionExpiresAt) return;

        const session = await Session.exists({
            token: identity.sessionToken
        });

        if (!session) kickPlayer(socket, "Invalid Session.");
    });
}