import { json, Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { ProfileAvatar, profileAvatarSchema } from "shared/types/PublicProfile";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { User } from "@/database/models/account";

const path = "/edit-avatar"

export const editAvatarRouter = Router();

editAvatarRouter.use(path,
    json(),
    sessionAuthenticator()
);

editAvatarRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const avatar: ProfileAvatar = req.body;

    if (!profileAvatarSchema.safeParse(avatar).success)
        return res.status(StatusCodes.BAD_REQUEST).end();

    await User.findByIdAndUpdate(new Types.ObjectId(req.user.id), {
        avatarColour: avatar.colour,
        avatarPiece: avatar.piece
    });

    res.end();
});