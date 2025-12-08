import { Cooldown } from "@/types/Cooldown";

export interface PlayerMovePacket {
    x: number;
    y: number;
}

export interface PlayerMoveAck {
    cancelled: boolean;
    cooldown?: Cooldown;
    attack?: boolean;
}