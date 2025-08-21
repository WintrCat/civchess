import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

const authClient = createAuthClient({
    basePath: "/auth",
    plugins: [inferAdditionalFields({
        user: {
            roles: { type: "string[]" }
        }
    })]
});

export default authClient;