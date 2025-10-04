import { UserRole } from "shared/constants/UserRole";
import { ProfileAvatarPiece } from "shared/constants/PieceType";

// Chess pieces
import wP from "@assets/img/pieces/wP.svg";
import wN from "@assets/img/pieces/wN.svg";
import wB from "@assets/img/pieces/wB.svg";
import wR from "@assets/img/pieces/wR.svg";
import wQ from "@assets/img/pieces/wQ.svg";
import wK from "@assets/img/pieces/wK.svg";
import bP from "@assets/img/pieces/bP.svg";
import bN from "@assets/img/pieces/bN.svg";
import bB from "@assets/img/pieces/bB.svg";
import bR from "@assets/img/pieces/bR.svg";
import bQ from "@assets/img/pieces/bQ.svg";
import bK from "@assets/img/pieces/bK.svg";

export const userRoleDisplays = {
    [UserRole.ADMIN]: {
        name: "WINTRCAT",
        color: "#3b5cff70"
    },
    [UserRole.STAFF]: {
        name: "EVENT STAFF",
        color: "#3fd65870"
    },
    [UserRole.CREATOR]: {
        name: "CONTENT CREATOR",
        color: "#ff5f5f70"
    }
};

export const pieceImages: Record<ProfileAvatarPiece, any> = {
    wP, wN, wB, wR, wQ, wK,
    bP, bN, bB, bR, bQ, bK
};