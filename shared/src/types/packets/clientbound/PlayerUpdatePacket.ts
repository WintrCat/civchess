import { Player } from "@/types/world/Player";

type PlayerUpdates = Partial<Pick<Player, "colour" | "health">>;

export interface PlayerUpdatePacket extends PlayerUpdates {
    x: number;
    y: number;
}