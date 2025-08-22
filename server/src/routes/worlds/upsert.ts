import { Router, json } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { omit } from "es-toolkit";

import { WorldOptions, worldOptionsSchema } from "shared/types/World";
import { UserWorld } from "@/database/models/UserWorld";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { generateWorld } from "@/lib/generate-world";
import { UserRole } from "shared/constants/UserRole";

const path = "/upsert";

export const upsertWorldRouter = Router();

upsertWorldRouter.use(path,
    json(),
    sessionAuthenticator()
);

upsertWorldRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const options: WorldOptions = req.body;

    if (!worldOptionsSchema.safeParse(options).success)
        return res.status(StatusCodes.BAD_REQUEST).end();

    if (!req.user.roles.includes(UserRole.ADMIN))
        options.pinned = false;

    const existingWorld = await UserWorld.findOne({ code: options.code });

    if (!existingWorld) {
        const world = generateWorld(options);

        console.log(world);

        await UserWorld.create({
            ...world,
            userId: new Types.ObjectId(req.user.id)
        });

        return res.end();
    }

    if (existingWorld.userId.toString() != req.user.id)
        return res.status(StatusCodes.UNAUTHORIZED).end();

    await existingWorld.updateOne(
        omit(options, ["squareTypes"])
    );

    res.end();
});