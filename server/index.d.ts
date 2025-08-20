import { Session, User } from "better-auth";
import { getAuth } from "@/lib/auth";

type InferAuth = ReturnType<typeof getAuth>["$Infer"]["Session"];

declare global {
    namespace Express {
        interface Request {
            session?: Session;
            user?: InferAuth["user"];
        }
    }
}