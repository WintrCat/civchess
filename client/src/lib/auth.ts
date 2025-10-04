import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

import { ProfileAvatar } from "shared/types/PublicProfile";
import { ProfileAvatarPiece } from "shared/constants/PieceType";

export type AuthInfer = typeof authClient["$Infer"]["Session"];

export const authClient = createAuthClient({
    basePath: "/auth",
    plugins: [inferAdditionalFields({
        user: {
            roles: { type: "string[]" },
            avatarColour: { type: "string" },
            avatarPiece: { type: "string" }
        }
    })]
});

export function getAvatar(user: AuthInfer["user"]): ProfileAvatar {
    return {
        colour: user.avatarColour,
        piece: user.avatarPiece as ProfileAvatarPiece
    };
}