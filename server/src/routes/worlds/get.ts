import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { WorldMetadata } from "shared/types/game/World";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";
import { getWorldMetadata } from "@/lib/world-metadata";

const path = "/get";

export const getWorldsRouter = Router();

getWorldsRouter.use(path, sessionAuthenticator());

// query params ?code, ?pinned
getWorldsRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const code = req.query.code?.toString();

    const filter = req.query.pinned?.toString()
        ? { pinned: true }
        : {
            userId: new Types.ObjectId(req.user.id),
            ...(code ? { code } : {})
        };

    const worlds = await UserWorld.find(filter)
        .select("-chunks").lean();

    const worldMetadatas: WorldMetadata[] = worlds
        .map(world => getWorldMetadata(world));

    res.json(worldMetadatas);
});