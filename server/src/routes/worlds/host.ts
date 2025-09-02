import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { sessionAuthenticator } from "@/lib/auth/middleware";
import { hostWorld } from "@/lib/worlds/server";
import { fetchWorld, toBaseWorld } from "@/lib/worlds/fetch";

const path = "/host";

export const hostWorldRouter = Router();

hostWorldRouter.use(path, sessionAuthenticator());

hostWorldRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const worldCode = req.query.code?.toString();
    if (!worldCode) return res.status(StatusCodes.BAD_REQUEST).end();

    const userWorld = await fetchWorld({
        code: worldCode,
        userId: new Types.ObjectId(req.user.id)
    });

    if (!userWorld) return res.status(StatusCodes.NOT_FOUND).end();

    try {
        await hostWorld(toBaseWorld(userWorld));
    } catch {
        return res.status(StatusCodes.CONFLICT).end();
    }

    res.end();
});