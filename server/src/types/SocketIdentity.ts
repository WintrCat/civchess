import { Socket } from "socket.io";

import { PublicProfile } from "shared/types/PublicProfile";

export interface SocketIdentity {
    sessionToken: string;
    sessionExpiresAt: number; // Unix timestamp
    worldCode: string;
    profile: PublicProfile;
}

export function isIdentified(
    socketData: Socket["data"]
): socketData is SocketIdentity {
    const identity = socketData as Partial<SocketIdentity>;
    return !!identity.sessionToken;
}