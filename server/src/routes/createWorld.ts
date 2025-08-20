import { Router, json } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";

import { WorldOptions, worldOptionsSchema } from "shared/types/World";
import { UserWorld } from "@/database/models/UserWorld";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { generateWorld } from "@/lib/generateWorld";

const path = "/create-world";

export const createWorldRouter = Router();

createWorldRouter.use(path,
    json(),
    sessionAuthenticator()
);

createWorldRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const options: WorldOptions = req.body;

    if (!worldOptionsSchema.safeParse(options).success)
        return res.status(StatusCodes.BAD_REQUEST).end();

    const world = generateWorld(options);

    console.log(world);

    await UserWorld.create({
        ...world,
        userId: new Types.ObjectId(req.user.id)
    });

    res.status(StatusCodes.OK).end();
});