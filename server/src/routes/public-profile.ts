import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { User } from "@/database/models/account";
import { toPublicProfile } from "@/lib/public-profile";

export const publicProfileRouter = Router();

publicProfileRouter.get("/public-profile", async (req, res) => {
    const username = req.query.username?.toString();
    const user = await User.findOne({ name: username }).lean();

    if (!username || !user)
        return res.status(StatusCodes.NOT_FOUND).end();

    res.json(toPublicProfile(user));
});