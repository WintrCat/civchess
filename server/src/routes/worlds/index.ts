import { Router } from "express";

import { upsertWorldRouter } from "./upsert";
import { getWorldsRouter } from "./get";
import { deleteWorldRouter } from "./delete";

export const worldsRouter = Router();

worldsRouter.use("/worlds",
    upsertWorldRouter,
    getWorldsRouter,
    deleteWorldRouter
);