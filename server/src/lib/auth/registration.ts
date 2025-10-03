import { User as AuthBaseUser } from "better-auth";
import { generateUsername } from "unique-username-generator";

import { StandardPieceType } from "shared/constants/PieceType";
import { AuthInfer } from "@/lib/auth";
import { User } from "@/database/models/account";

export const minUsernameLength = 3;
export const maxUsernameLength = 20;

export const userInitialiser = async (
    user: AuthBaseUser
): Promise<{ data: any }> => {
    let username = user.name.toLowerCase()
        .replace(/[^a-z0-9_]/gi, "")
        .slice(0, maxUsernameLength);

    while (
        username.length < minUsernameLength
        || await User.findOne({ name: username })
    ) username = generateUsername();

    const initialisedUser: AuthInfer["user"] = {
        ...user,
        name: username,
        roles: [],
        avatarColour: "#3b3e43",
        avatarPiece: "wK" satisfies StandardPieceType
    };

    return { data: initialisedUser };
};