import { Router } from "express";

import { createWorldRouter } from "./createWorld";

export const apiRouter = Router();

apiRouter.use("/api", createWorldRouter);