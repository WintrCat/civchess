import { Router } from "express";

import { createWorldRouter } from "./createWorld";
import { getWorldsRouter } from "./worlds";

export const apiRouter = Router();

apiRouter.use("/api",
    createWorldRouter,
    getWorldsRouter
);