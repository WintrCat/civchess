import { Router } from "express";

import { worldsRouter } from "./worlds";
import { publicProfileRouter } from "./public-profile";

export const apiRouter = Router();

apiRouter.use("/api",
    worldsRouter,
    publicProfileRouter
);