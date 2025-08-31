import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { worldMetadataSchema } from "shared/types/game/World";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";
import { redisClient } from "@/database/redis";

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

    const worldMetadatas = (await Promise.all(
        worlds.map(async world => {
            const server = await redisClient.json.get(`world:${world.code}`);

            return worldMetadataSchema.safeParse({
                ...world, online: server != null
            }).data;
        })
    )).filter(metadata => !!metadata);

    res.json(worldMetadatas);
});