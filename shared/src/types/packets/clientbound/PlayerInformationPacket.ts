import { Player } from "@/types/world/Player";

export interface PlayerInformationPacket extends Player {
    maxHealth: number;
}