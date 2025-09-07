import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config({ path: "../.env", quiet: true });

if (!process.env.PUBLIC_DEV_ORIGIN)
    throw new Error("vite dev server origin not specified.");

const config = defineConfig({
    root: "src",
    resolve: {
        alias: {
            "@": resolve("src"),
            "@assets": resolve("public")
        }
    },
    build: {
        outDir: resolve("dist"),
        emptyOutDir: true
    },
    publicDir: resolve("public"),
    envDir: resolve(".."),
    envPrefix: "PUBLIC_",
    server: {
        port: Number(new URL(process.env.PUBLIC_DEV_ORIGIN).port) || 3000,
        proxy: process.env.PUBLIC_ORIGIN ? {
            "/api": { target: process.env.PUBLIC_ORIGIN },
            "/auth": { target: process.env.PUBLIC_ORIGIN }
        } : undefined
    },
    plugins: [react()]
});

export default config;