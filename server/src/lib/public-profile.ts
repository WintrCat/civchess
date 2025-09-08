import { PublicProfile } from "shared/types/PublicProfile";
import { UserRole } from "shared/constants/UserRole";
import { StandardPieceType } from "shared/constants/StandardPieceType";

import { AuthInfer } from "./auth";

export function toPublicProfile(user: AuthInfer["user"]): PublicProfile {
    return {
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        roles: user.roles as UserRole[],
        avatar: {
            colour: user.avatarColour,
            piece: user.avatarPiece as StandardPieceType
        }
    };
}