import { Socket } from "socket.io";

import { PublicProfile } from "shared/types/PublicProfile";

export interface SocketIdentity {
    sessionToken: string;
    sessionExpiresAt: number; // Unix timestamp
    worldCode: string;
    profile: PublicProfile;
}

export function isIdentified(socket: Pick<Socket, "data">) {
    const identity = socket.data as Partial<SocketIdentity>;
    return !!identity.sessionToken;
}