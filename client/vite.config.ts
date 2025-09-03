import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config({ path: "../.env", quiet: true });

if (!process.env.VITE_DEV_ORIGIN)
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
    server: {
        port: Number(new URL(process.env.VITE_DEV_ORIGIN).port) || 3000,
        proxy: process.env.ORIGIN ? {
            "/api": { target: process.env.ORIGIN },
            "/auth": { target: process.env.ORIGIN }
        } : undefined
    },
    plugins: [react()]
});

export default config;