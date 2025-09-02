import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { sessionAuthenticator } from "@/lib/auth/middleware";
import { fetchWorld } from "@/lib/worlds/fetch";
import { shutdownWorld } from "@/lib/worlds/server";

const path = "/shutdown";

export const shutdownWorldRouter = Router();

shutdownWorldRouter.use(path, sessionAuthenticator());

shutdownWorldRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const worldCode = req.query.code?.toString();
    if (!worldCode) return res.status(StatusCodes.BAD_REQUEST).end();

    const world = await fetchWorld({
        code: worldCode,
        userId: new Types.ObjectId(req.user.id)
    }, { code: true });

    if (!world) return res.status(StatusCodes.NOT_FOUND).end();

    await shutdownWorld(world.code);

    res.end();
});