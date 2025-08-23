import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

export type AuthInfer = typeof authClient["$Infer"]["Session"];

export const authClient = createAuthClient({
    basePath: "/auth",
    plugins: [inferAdditionalFields({
        user: {
            roles: { type: "string[]" }
        }
    })]
});