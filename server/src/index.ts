import express from "express";
import cluster from "cluster";
import os from "os";
import { toNodeHandler } from "better-auth/node";
import { resolve } from "path";
import dotenv from "dotenv";

import { connectDatabase } from "@/database/connect";
import { getAuth } from "@/lib/auth";

dotenv.config({ quiet: true });

const coreCount = os.cpus().length;

async function main() {
    if (cluster.isPrimary) {
        console.log("starting server...");
        for (let i = 0; i < coreCount; i++) cluster.fork();

        return;
    }

    const app = express();

    await connectDatabase();

    app.use("/", express.static("client/dist"));
    app.all(/^\/auth\/.*/, toNodeHandler(getAuth().handler));

    app.get(/^\/.*/, async (req, res) => {
        res.sendFile(resolve("client/dist/index.html"));
    });

    const port = process.env.PORT || 8080;

    app.listen(port, () => {
        if (cluster.worker?.id != 1) return;

        console.log(
            `server running on port ${port} `
            + `(${coreCount} thread`
            + (coreCount > 1 ? "s)" : ")")
        );
    });
}

main();