import { Router, json } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { omit } from "es-toolkit";

import { UserRole } from "shared/constants/UserRole";
import { worldOptionsSchema } from "shared/types/game/World";
import { UserWorld } from "@/database/models/UserWorld";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { generateWorld } from "@/lib/generate-world";

const path = "/upsert";

export const upsertWorldRouter = Router();

upsertWorldRouter.use(path,
    json(),
    sessionAuthenticator()
);

upsertWorldRouter.post(path, async (req, res) => {
    if (!req.user) return res.status(StatusCodes.UNAUTHORIZED).end();

    const { data: options, success } = worldOptionsSchema
        .safeParse(req.body);

    if (!success) return res.status(StatusCodes.BAD_REQUEST).end();

    if (!req.user.roles.includes(UserRole.ADMIN))
        options.pinned = false;

    const worldCode = req.query.code?.toString();

    if (worldCode) {
        const updatingWorld = await UserWorld.findOne({ code: worldCode });

        if (!updatingWorld)
            return res.status(StatusCodes.NOT_FOUND).end();

        if (updatingWorld.userId.toString() != req.user.id)
            return res.status(StatusCodes.UNAUTHORIZED).end();

        await updatingWorld.updateOne(
            omit(options, ["squareTypes"])
        );

        return res.end();
    }

    if (await UserWorld.findOne({ code: options.code }))
        return res.status(StatusCodes.CONFLICT).end();

    const world = generateWorld(options);

    console.log(world);

    await UserWorld.create({
        ...world,
        userId: new Types.ObjectId(req.user.id)
    });

    res.end();
});