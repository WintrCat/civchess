import { createAuthClient } from "better-auth/react";

const authClient = createAuthClient({
    basePath: "/auth"
});

export default authClient;