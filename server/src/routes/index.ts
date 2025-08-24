import { Router } from "express";

import { accountRouter } from "./account";
import { worldsRouter } from "./worlds";
import { publicProfileRouter } from "./public-profile";

export const apiRouter = Router();

apiRouter.use("/api",
    accountRouter,
    worldsRouter,
    publicProfileRouter
);