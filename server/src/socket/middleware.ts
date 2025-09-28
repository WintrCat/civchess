import { Socket } from "socket.io";

import { SocketIdentity } from "@/types/SocketIdentity";
import { Session } from "@/database/models/account";
import { kickPlayer } from "./lib/manage-players";

export function attachPacketMiddleware(socket: Socket) {
    socket.onAny(async () => {
        const identity = socket.data as SocketIdentity | undefined;
        
        if (
            !identity?.sessionExpiresAt
            || Date.now() < identity.sessionExpiresAt
        ) return;

        const session = await Session.exists({
            token: identity.sessionToken
        });

        if (!session) kickPlayer(socket, "Invalid Session.");
    });
}