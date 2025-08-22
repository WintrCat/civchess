import { Router } from "express";

import { worldsRouter } from "./worlds";

export const apiRouter = Router();

apiRouter.use("/api", worldsRouter);