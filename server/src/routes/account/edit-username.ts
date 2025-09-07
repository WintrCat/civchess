import { Router, text } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import z from "zod";

import { User } from "@/database/models/account";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { minUsernameLength, maxUsernameLength } from "@/lib/auth/registration";

const path = "/edit-username"

export const editUsernameRouter = Router();

const usernameSchema = z.string()
    .regex(/^[a-z0-9_]+$/i)
    .min(minUsernameLength)
    .max(maxUsernameLength);

editUsernameRouter.use(path,
    text(),
    sessionAuthenticator()
);

editUsernameRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const username: string = req.body;

    if (!usernameSchema.safeParse(username).success)
        return res.status(StatusCodes.BAD_REQUEST).end();

    const existingNameHolder = await User.findOne({ name: username });

    if (existingNameHolder?.id == req.user.id)
        return res.status(StatusCodes.NOT_MODIFIED).end();

    if (existingNameHolder)
        return res.status(StatusCodes.CONFLICT).end();

    // TO-DO: Kick this user from all world servers

    await User.findByIdAndUpdate(
        new Types.ObjectId(req.user.id),
        { name: username }
    );

    res.end();
});