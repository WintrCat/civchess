export interface PieceMovePacket {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    ephemeral?: boolean;
}