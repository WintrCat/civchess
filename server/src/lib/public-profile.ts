import { RootFilterQuery } from "mongoose";

import { PublicProfile } from "shared/types/PublicProfile";
import { UserRole } from "shared/constants/UserRole";
import { StandardPieceType } from "shared/constants/StandardPieceType";
import { User } from "@/database/models/account";
import { AuthInfer } from "./auth";

export async function getPublicProfile(
    filter: RootFilterQuery<AuthInfer["user"]>
): Promise<PublicProfile | null> {
    const user = await User.findOne(filter).lean();

    return user && {
        userId: user._id.toString(),
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        roles: user.roles as UserRole[],
        avatar: {
            colour: user.avatarColour,
            piece: user.avatarPiece as StandardPieceType
        }
    };
}