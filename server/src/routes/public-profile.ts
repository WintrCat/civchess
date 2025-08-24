import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { StandardPieceType } from "shared/constants/StandardPieceType";
import { UserRole } from "shared/constants/UserRole";
import { PublicProfile } from "shared/types/PublicProfile";
import { User } from "@/database/models/account";

export const publicProfileRouter = Router();

publicProfileRouter.get("/public-profile", async (req, res) => {
    const username = req.query.username?.toString();
    const user = await User.findOne({ name: username }).lean();

    if (!username || !user)
        return res.status(StatusCodes.NOT_FOUND).end();

    res.json({
        name: user.name,
        createdAt: user.createdAt.toISOString(),
        roles: user.roles as UserRole[],
        avatar: {
            colour: user.avatarColour,
            piece: user.avatarPiece as StandardPieceType
        }
    } satisfies PublicProfile);
});