import { Router, text } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";
import z from "zod";

import { User } from "@/database/models/account";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import {
    minUsernameLength,
    maxUsernameLength,
    profanityFilter
} from "@/lib/auth/registration";
import { getPlayerSocket, kickPlayer } from "@/socket/lib/players";

const path = "/edit-username"

export const editUsernameRouter = Router();

const usernameSchema = z.string()
    .regex(/^[a-z0-9_]+$/i)
    .min(minUsernameLength)
    .max(maxUsernameLength)
    .refine(username => !profanityFilter.hasMatch(username), {
        error: "Username contains blacklisted words."
    });

editUsernameRouter.use(path,
    text(),
    sessionAuthenticator()
);

editUsernameRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const username: string = req.body;

    const validation = usernameSchema.safeParse(username);

    if (!validation.success) return res
        .status(StatusCodes.BAD_REQUEST)
        .send(validation.error.issues.at(0)?.message);

    // If you or someone else already has this username
    const existingNameHolder = await User.findOne({ name: username });

    if (existingNameHolder?.id == req.user.id)
        return res.status(StatusCodes.NOT_MODIFIED).end();

    if (existingNameHolder)
        return res.status(StatusCodes.CONFLICT).end();

    // Disconnect user from any world servers
    const playerSocket = await getPlayerSocket(req.user.id);
    if (playerSocket) kickPlayer(playerSocket,
        "You changed your username, please reconnect."
    );

    // Update username in database
    await User.findByIdAndUpdate(
        new Types.ObjectId(req.user.id),
        { name: username }
    );

    res.end();
});