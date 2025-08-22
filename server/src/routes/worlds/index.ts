import { Router } from "express";

import { createWorldRouter } from "./create";
import { getWorldsRouter } from "./get";
import { deleteWorldRouter } from "./delete";

export const worldsRouter = Router();

worldsRouter.use("/worlds",
    createWorldRouter,
    getWorldsRouter,
    deleteWorldRouter
)