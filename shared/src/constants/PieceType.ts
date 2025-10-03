export const standardPieceTypes = [
    "wP", "wN", "wB", "wR", "wQ", "wK",
    "bP", "bN", "bB", "bR", "bQ", "bK"
] as const;

export type StandardPieceType = typeof standardPieceTypes[number];

export enum PieceType {
    PAWN,
    KNIGHT,
    BISHOP,
    ROOK,
    QUEEN,
    KING,
    GUARD,
    FLAG
}