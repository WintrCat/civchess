import { Server } from "http";
import express from "express";
import cluster from "cluster";
import { cpus } from "os";
import { toNodeHandler } from "better-auth/node";
import { resolve } from "path";
import dotenv from "dotenv";
import chalk from "chalk";

import { connectDatabase } from "./database/connect";
import { connectRedisClient } from "./database/redis";
import { getAuth } from "./lib/auth";
import { validateConfig } from "./lib/config";
import { apiRouter } from "./routes";
import { createSocketServer } from "./socket";

dotenv.config({ quiet: true });

const coreCount = Number(process.env.THREAD_COUNT) || cpus().length;

async function main() {
    if (!process.env.PUBLIC_ORIGIN)
        throw new Error("origin not specified.");

    validateConfig();

    if (cluster.isPrimary) {
        console.log("starting server...");
        for (let i = 0; i < coreCount; i++) cluster.fork();

        return;
    }

    // Connect databases
    await connectDatabase();
    await connectRedisClient();

    // Create servers
    const app = express();

    app.use("/", express.static("client/dist"));

    app.all(/^\/auth\/.*/, toNodeHandler(getAuth().handler));
    app.use("/", apiRouter);

    app.get(/^\/.*/, async (req, res) => {
        res.sendFile(resolve("client/dist/index.html"));
    });

    const server = new Server(app);
    await createSocketServer(server);

    const port = new URL(process.env.PUBLIC_ORIGIN).port || 8080;

    server.listen(port, () => {
        if (cluster.worker?.id != 1) return;

        console.log(chalk.bold.blueBright("\nCIVCHESS"));

        console.log(
            chalk.greenBright("➜")
            + chalk.reset(" deployed at ")
            + chalk.bold(process.env.PUBLIC_ORIGIN)
        );

        console.log(
            chalk.greenBright("➜")
            + chalk.reset(" running on ")
            + chalk.bold(coreCount)
            + chalk.reset(" thread(s)")
        );
    });
}

main();