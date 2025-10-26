export interface PlayerMovePacket {
    x: number;
    y: number;
}

export interface PlayerMoveAck {
    success: boolean;
}