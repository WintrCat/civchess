import { Router } from "express";
import { editAvatarRouter } from "./edit-avatar";

export const accountRouter = Router();

accountRouter.use("/account", editAvatarRouter);