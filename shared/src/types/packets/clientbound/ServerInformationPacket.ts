import { PublicProfile } from "@/types/PublicProfile";
import { Player } from "@/types/world/Player";

export interface ServerInformationPacket {
    localPlayer: Player;
    players: PublicProfile[];
    worldChunkSize: number; // World Size in chunks
}