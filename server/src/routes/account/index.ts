import { Router } from "express";

import { editAvatarRouter } from "./edit-avatar";
import { editUsernameRouter } from "./edit-username";

export const accountRouter = Router();

accountRouter.use("/account",
    editAvatarRouter,
    editUsernameRouter
);