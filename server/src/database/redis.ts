import { readFileSync } from "fs";
import { Redis } from "ioredis";

type ObjectValue = string | number | boolean | object;

class ExtendedRedis extends Redis {
    private moveScript?: string;

    private async getNumericalResponse(
        command: string,
        key: string,
        path: string
    ) {
        const response = await this.call(command, key, path);
        if (!Array.isArray(response)) return 0;

        return Number(response.at(0)) || 0;
    }

    async loadScripts() {
        const scriptsFolder = "server/src/database/scripts";

        this.moveScript = String(
            await this.script("LOAD", readFileSync(
                `${scriptsFolder}/move.lua`, "utf-8"
            ))
        );

        return this;
    }

    json = {
        set: async (
            key: string,
            path: string,
            value: ObjectValue,
            modifier?: "NX" | "XX"
        ) => {
            const args = [
                "json.set", key, path, JSON.stringify(value)
            ] as const;

            if (modifier) {
                this.call(...args, modifier);
            } else {
                this.call(...args);
            }
        },

        get: async <Val extends ObjectValue>(
            key: string, path: string
        ): Promise<Val | null> => {
            try {
                const getResponse = await this.call("json.get", key, path);

                const matches = JSON.parse(String(getResponse));
                if (!Array.isArray(matches)) return null;

                return matches.at(0) || null;
            } catch {
                return null;
            }
        },

        delete: async (key: string, path: string) => {
            return await this.getNumericalResponse("json.del", key, path);
        },

        exists: async (key: string, path: string) => {
            const response = await this.call("json.type", key, path);
            
            return Array.isArray(response) && response.length > 0;
        },

        length: async (key: string, path: string) => {
            return await this.getNumericalResponse("json.arrlen", key, path);
        },

        move: async (key: string, path: string, newPath: string) => {
            if (!this.moveScript) return;

            await this.evalsha(this.moveScript,
                1, key, path, newPath
            );
        }
    };
}

let instance: ExtendedRedis | null = null;

export async function connectRedisClient() {
    if (!process.env.REDIS_DATABASE_URI)
        return console.log("redis database uri not specified.");

    const parsedURI = new URL(process.env.REDIS_DATABASE_URI);

    const connection = new ExtendedRedis({
        host: parsedURI.hostname,
        port: Number(parsedURI.port)
    });

    connection.on("error", err => {
        console.log("failed to connect to redis database:");
        console.log(err);
    });

    await connection.loadScripts();

    return instance = connection;
}

export function getRedisClient() {
    if (!instance)
        throw new Error("redis client referenced before creation.");

    return instance;
}