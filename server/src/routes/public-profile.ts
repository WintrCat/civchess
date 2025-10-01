import { Router } from "express";
import { StatusCodes } from "http-status-codes";

import { getPublicProfile } from "@/lib/public-profile";

export const publicProfileRouter = Router();

publicProfileRouter.get("/public-profile", async (req, res) => {
    const username = req.query.username?.toString();
    if (!username) return res.status(StatusCodes.BAD_REQUEST).end();
    
    const profile = await getPublicProfile({ name: username });
    if (!profile) return res.status(StatusCodes.NOT_FOUND).end();

    res.json(profile);
});