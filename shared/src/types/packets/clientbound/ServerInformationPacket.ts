import { PublicProfile } from "@/types/PublicProfile";

export interface ServerInformationPacket {
    players: PublicProfile[];
    worldChunkSize: number; // World Size in chunks
}