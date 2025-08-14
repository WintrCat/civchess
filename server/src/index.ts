import express from "express";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use("/", express.static("client/dist"));

app.get(/^\/.*/, async (req, res) => {
    res.sendFile(resolve("client/dist/index.html"));
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`backend server running on port ${port}`);
});