import { Router } from "express";
import { Types } from "mongoose";
import { StatusCodes } from "http-status-codes";

import { sessionAuthenticator } from "@/lib/auth/middleware";
import { fetchWorldMetadatas } from "@/lib/worlds/fetch";

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

    const worldMetadatas = await fetchWorldMetadatas(filter);

    res.json(worldMetadatas);
});