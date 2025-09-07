import { Server } from "http";
import express from "express";
import cluster from "cluster";
import os from "os";
import { toNodeHandler } from "better-auth/node";
import { resolve } from "path";
import dotenv from "dotenv";
import chalk from "chalk";

import { connectDatabase } from "@/database/connect";
import { getAuth } from "@/lib/auth";
import { apiRouter } from "./routes";
import { createSocketServer } from "./lib/socket";
import { createRedisClient } from "./database/redis";

dotenv.config({ quiet: true });

const coreCount = Number(process.env.THREAD_COUNT) || os.cpus().length;

async function main() {
    if (!process.env.PUBLIC_ORIGIN)
        return console.log("origin not specified.");

    if (!process.env.REDIS_DATABASE_URI)
        return console.log("redis database uri not specified.");

    if (cluster.isPrimary) {
        console.log("starting server...");
        for (let i = 0; i < coreCount; i++) cluster.fork();

        return;
    }

    await connectDatabase();
    
    createRedisClient(process.env.REDIS_DATABASE_URI);

    const app = express();

    app.use("/", express.static("client/dist"));

    app.all(/^\/auth\/.*/, toNodeHandler(getAuth().handler));
    app.use("/", apiRouter);

    app.get(/^\/.*/, async (req, res) => {
        res.sendFile(resolve("client/dist/index.html"));
    });

    const server = new Server(app);

    createSocketServer(server);

    const port = new URL(process.env.PUBLIC_ORIGIN).port || 8080;

    server.listen(port, () => {
        if (cluster.worker?.id != 1) return;

        console.log(
            chalk.bold.blueBright("\nCIVCHESS")
            + chalk.white(" - by the wintrcat community")
        );

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