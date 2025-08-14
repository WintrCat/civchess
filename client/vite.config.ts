import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const config = defineConfig({
    root: "src",
    resolve: {
        alias: {
            "@": resolve("src"),
            "@assets": resolve("public")
        }
    },
    build: {
        outDir: "../dist"
    },
    publicDir: "public",
    server: {
        port: 8080
    },
    plugins: [react()]
});

export default config;