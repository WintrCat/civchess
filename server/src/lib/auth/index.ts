import cluster from "cluster";
import mongoose, { mongo } from "mongoose";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

import { Collection } from "@/constants/Collection";
import { userInitialiser } from "./registration";

export type AuthType = ReturnType<typeof createAuth>;
export type AuthInfer = AuthType["$Infer"]["Session"];

let instance: AuthType | null = null;

function createAuth(database: mongo.Db) {
    if (!process.env.ORIGIN) {
        throw new Error("origin not specified.");
    }

    if (!process.env.AUTH_SECRET) {
        throw new Error("auth secret not specified.");
    }

    if (
        !process.env.GOOGLE_OAUTH_CLIENT_ID
        || !process.env.GOOGLE_OAUTH_CLIENT_SECRET
    ) throw new Error("google oauth credentials not fully specified.");

    return betterAuth({
        baseURL: `${process.env.ORIGIN}/auth`,
        trustedOrigins: process.env.VITE_DEV_ORIGIN
            ? [process.env.VITE_DEV_ORIGIN] : [],
        secret: process.env.AUTH_SECRET,
        database: mongodbAdapter(database),
        socialProviders: {
            google: {
                clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
                clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET
            }
        },
        user: {
            modelName: Collection.USERS,
            additionalFields: {
                roles: { type: "string[]", input: false }
            },
            deleteUser: { enabled: true }
        },
        account: { modelName: Collection.ACCOUNTS },
        session: { modelName: Collection.SESSIONS },
        databaseHooks: {
            user: {
                create: { before: userInitialiser }
            }
        },
        logger: { disabled: cluster.worker?.id != 1 },
        advanced: { cookiePrefix: "civchess" },
        telemetry: { enabled: false }
    });
}

export function getAuth() {
    if (!mongoose.connection.db) throw new Error(
        "cannot initialise auth without database connection."
    );

    return instance ??= createAuth(mongoose.connection.db);
}