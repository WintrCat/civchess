import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";

const path = "/host";

export const hostWorldRouter = Router();

hostWorldRouter.use(path, sessionAuthenticator());

hostWorldRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const worldCode = req.query.code?.toString();
    if (!worldCode) return res.status(StatusCodes.BAD_REQUEST).end();

    const world = await UserWorld.findOne({
        code: worldCode,
        userId: new Types.ObjectId(req.user.id)
    });

    if (!world) return res.status(StatusCodes.NOT_FOUND).end();

    // if this world is already in redis, reject request

    // put a copy of the world in to redis

    res.end();
});