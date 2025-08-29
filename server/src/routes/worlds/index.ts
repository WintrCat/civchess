import { Router } from "express";

import { upsertWorldRouter } from "./upsert";
import { getWorldsRouter } from "./get";
import { deleteWorldRouter } from "./delete";
import { hostWorldRouter } from "./host";

export const worldsRouter = Router();

worldsRouter.use("/worlds",
    upsertWorldRouter,
    getWorldsRouter,
    deleteWorldRouter,
    hostWorldRouter
);