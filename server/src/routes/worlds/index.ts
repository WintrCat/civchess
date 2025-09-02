import { Router } from "express";

import { upsertWorldRouter } from "./upsert";
import { getWorldsRouter } from "./get";
import { deleteWorldRouter } from "./delete";
import { hostWorldRouter } from "./host";
import { shutdownWorldRouter } from "./shutdown";

export const worldsRouter = Router();

worldsRouter.use("/worlds",
    upsertWorldRouter,
    getWorldsRouter,
    deleteWorldRouter,
    hostWorldRouter,
    shutdownWorldRouter
);