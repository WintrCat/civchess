import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { toWorldMetadata, WorldMetadata } from "shared/types/World";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";

const path = "/get";

export const getWorldsRouter = Router();

getWorldsRouter.use(path, sessionAuthenticator());

getWorldsRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    if (req.query.pinned?.toString()) {
        const pinnedWorlds = await UserWorld.find({ pinned: true })
            .select("-chunks").lean();

        const pinnedWorldMetadatas = pinnedWorlds
            .map(world => toWorldMetadata(world));

        return res.json(pinnedWorldMetadatas);
    }

    const code = req.query.code?.toString();

    const worlds = await UserWorld.find({
        userId: new Types.ObjectId(req.user.id),
        ...(code ? { code } : {})
    }).select("-chunks").lean();

    const worldMetadatas: WorldMetadata[] = worlds
        .map(world => toWorldMetadata(world));

    res.json(worldMetadatas);
});