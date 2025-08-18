import express from "express";
import cors from "cors";
import cluster from "cluster";
import os from "os";
import { toNodeHandler } from "better-auth/node";
import { resolve } from "path";
import dotenv from "dotenv";
import chalk from "chalk";

import { connectDatabase } from "@/database/connect";
import { getAuth } from "@/lib/auth";
import { apiRouter } from "./routes";

dotenv.config({ quiet: true });

const coreCount = os.cpus().length;

async function main() {
    if (!process.env.ORIGIN)
        return console.log("origin not specified.");

    if (cluster.isPrimary) {
        console.log("starting server...");
        for (let i = 0; i < coreCount; i++) cluster.fork();

        return;
    }

    const app = express();

    await connectDatabase();

    app.use("/", express.static("client/dist"));

    app.all(/^\/auth\/.*/, toNodeHandler(getAuth().handler));
    app.use("/", apiRouter);

    app.get(/^\/.*/, async (req, res) => {
        res.sendFile(resolve("client/dist/index.html"));
    });

    const port = new URL(process.env.ORIGIN).port || 8080;

    app.listen(port, () => {
        if (cluster.worker?.id != 1) return;

        console.log(
            chalk.bold.blueBright("\nCIVCHESS")
            + chalk.white(" - by the wintrcat community")
        );

        console.log(
            chalk.greenBright("➜")
            + chalk.reset(" deployed at ")
            + chalk.bold(process.env.ORIGIN)
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