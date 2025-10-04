export const profileAvatarPieces = [
    "wP", "wN", "wB", "wR", "wQ", "wK",
    "bP", "bN", "bB", "bR", "bQ", "bK"
] as const;

export type ProfileAvatarPiece = typeof profileAvatarPieces[number];

export enum PieceType {
    PLAYER = "player",
    REMOTE_PIECE = "remotePiece",
    GUARD = "guard",
    FLAG = "flag"
}

export enum RemotePieceType {
    KNIGHT = "n",
    BISHOP = "b",
    ROOK = "r",
    QUEEN = "q",
}