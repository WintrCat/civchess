import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { worldSchema } from "shared/types/game/World";
import { OnlineWorld } from "@/types/OnlineWorld";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { UserWorld } from "@/database/models/UserWorld";
import { redisClient } from "@/database/redis";

const path = "/host";

export const hostWorldRouter = Router();

hostWorldRouter.use(path, sessionAuthenticator());

hostWorldRouter.get(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const worldCode = req.query.code?.toString();
    if (!worldCode) return res.status(StatusCodes.BAD_REQUEST).end();

    const userWorld = await UserWorld.findOne({
        code: worldCode,
        userId: new Types.ObjectId(req.user.id)
    }).lean();

    if (!userWorld) return res.status(StatusCodes.NOT_FOUND).end();

    // Strip document-specific properties from user world
    const { data: world } = worldSchema.safeParse(userWorld);
    if (!world) return res.status(StatusCodes.INTERNAL_SERVER_ERROR).end();

    console.log("host request received");
    console.log(world);

    // Do not host a world that is already online
    const existingServer = await redisClient.json.get(`world:${world.code}`);
    if (existingServer) return res.status(StatusCodes.CONFLICT).end();

    // Move world to Redis
    await redisClient.json.set(`world:${world.code}`, "$", {
        ...world, connectedPlayers: []
    } satisfies OnlineWorld);

    res.end();
});