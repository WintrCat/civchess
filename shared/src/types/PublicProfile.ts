import z from "zod";

import { profileAvatarPieces } from "@/constants/PieceType";
import { UserRole } from "@/constants/UserRole";

export const profileAvatarSchema = z.object({
    colour: z.string().regex(/^#[a-f0-9]{6}/),
    piece: z.enum(profileAvatarPieces)
});

export type ProfileAvatar = z.infer<typeof profileAvatarSchema>;

export interface PublicProfile {
    userId: string;
    name: string;
    createdAt: string;
    roles: UserRole[];
    avatar: ProfileAvatar;
}