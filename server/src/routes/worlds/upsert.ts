import { Router, json } from "express";
import { StatusCodes } from "http-status-codes";
import { Types } from "mongoose";
import { omit } from "es-toolkit";

import { UserRole } from "shared/constants/UserRole";
import { worldOptionsSchema } from "shared/types/game/World";
import { UserWorld } from "@/database/models/UserWorld";
import { sessionAuthenticator } from "@/lib/auth/middleware";
import { generateWorld } from "@/lib/worlds/generate";
import { isWorldOnline } from "@/lib/worlds/server";
import { fetchWorld, worldExists } from "@/lib/worlds/fetch";
import { getMaximumWorldCount } from "@/constants/world-counts";

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

    // World pinning only available to Admin
    if (!req.user.roles.includes(UserRole.ADMIN))
        options.pinned = false;

    // Update an existing world with provided world code
    const worldCode = req.query.code?.toString();

    if (worldCode) {
        const updatingWorld = await fetchWorld({
            code: worldCode,
            userId: new Types.ObjectId(req.user.id)
        }, { code: true }, true);

        if (!updatingWorld)
            return res.status(StatusCodes.NOT_FOUND).end();

        if (await isWorldOnline(updatingWorld.code))
            return res.status(StatusCodes.UNAUTHORIZED).end();

        await updatingWorld.updateOne(
            omit(options, ["squareTypes"])
        );

        return res.end();
    }

    // Create a new world
    if (await worldExists({ code: options.code }))
        return res.status(StatusCodes.CONFLICT).end();

    const userWorldCount = await UserWorld.countDocuments({
        userId: new Types.ObjectId(req.user.id)
    });

    const maxWorldCount = getMaximumWorldCount(req.user.roles as UserRole[]);
    if (userWorldCount >= maxWorldCount) return res
        .status(StatusCodes.INSUFFICIENT_STORAGE)
        .json(maxWorldCount);

    const world = generateWorld(options);

    console.log(world);

    await UserWorld.create({
        ...world,
        userId: new Types.ObjectId(req.user.id)
    });

    res.end();
});