import { PublicProfile } from "shared/types/PublicProfile";

export interface SocketIdentity {
    userId: string;
    sessionToken: string;
    sessionExpiresAt: number; // Unix timestamp
    worldCode: string;
    profile: PublicProfile;
}