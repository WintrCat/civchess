import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";
import { WorldMetadata } from "shared/types/World";

const path = "/worlds";

export const getWorldsRouter = Router();

getWorldsRouter.use(path, sessionAuthenticator());

getWorldsRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const worlds = await UserWorld.find({
        userId: new Types.ObjectId(req.user.id)
    }).select("-chunks").lean();

    const worldMetadatas: WorldMetadata[] = worlds.map(world => ({
        code: world.code,
        name: world.name,
        pinned: world.pinned,
        createdAt: world.createdAt,
        lastOnlineAt: world.lastOnlineAt
    }));

    res.json(worldMetadatas);
});