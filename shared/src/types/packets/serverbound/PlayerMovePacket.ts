export interface PlayerMovePacket {
    x: number;
    y: number;
}

export interface PlayerMoveAck {
    cancelled: boolean;
    cooldownExpiresAt?: number;
    attack?: boolean;
}