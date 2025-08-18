import { generateWorld } from "@/lib/generateWorld";
import { json, Router } from "express";
import { StatusCodes } from "http-status-codes";

import { WorldOptions, worldOptionsSchema } from "shared/types/World";

const path = "/create-world";

export const createWorldRouter = Router();

createWorldRouter.use(path, json());

createWorldRouter.post(path, async (req, res) => {
    const options: WorldOptions = req.body;

    if (!worldOptionsSchema.safeParse(options).success)
        return res.status(StatusCodes.BAD_REQUEST).end();

    console.log(generateWorld(options));

    res.status(StatusCodes.OK).end();
});