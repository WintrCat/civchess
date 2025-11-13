import { readFileSync } from "fs";
import { Redis, RedisValue } from "ioredis";
import { mapValues } from "es-toolkit";

export type ObjectValue = string | number | boolean | object;

class ExtendedRedis extends Redis {
    private moveScript?: string;

    private async getNumericalResponse(
        command: string,
        ...args: RedisValue[]
    ) {
        let response = await this.call(command, ...args);

        if (typeof response == "string") try {
            response = JSON.parse(String(response));
        } catch {}

        if (!Array.isArray(response)) return NaN;

        return Number(response.at(0));
    }

    async loadScripts() {
        const scriptsFolder = "server/src/database/scripts";

        this.moveScript = String(
            await this.script("LOAD", readFileSync(
                `${scriptsFolder}/move.lua`, "utf-8"
            ))
        );
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
                await this.call(...args, modifier);
            } else {
                await this.call(...args);
            }
        },

        get: async <Val extends ObjectValue>(
            key: string, path: string
        ): Promise<Val | null> => {
            try {
                const response = await this.call("json.get", key, path);

                const matches = JSON.parse(String(response));
                if (!Array.isArray(matches)) return null;

                return matches.at(0) || null;
            } catch {
                return null;
            }
        },

        incr: async (key: string, path: string, amount: number) => {
            return await this.getNumericalResponse(
                "json.numincrby", key, path, amount
            );
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

    createPipeline() {
        const multi = this.multi();

        const boundJson = mapValues(
            this.json,
            val => val.bind(multi)
        ) as typeof this.json;

        return { ...multi, json: boundJson };
    }
}

let instance: ExtendedRedis | null = null;

export async function connectRedisClient() {
    if (!process.env.REDIS_DATABASE_URI)
        return console.log("redis database uri not specified.");

    const parsedURI = new URL(process.env.REDIS_DATABASE_URI);

    const client = new ExtendedRedis({
        host: parsedURI.hostname,
        port: Number(parsedURI.port)
    });

    client.on("error", err => {
        console.log("failed to connect to redis database:");
        console.log(err);
    });

    await client.loadScripts();

    return instance = client;
}

export function getRedisClient() {
    if (!instance)
        throw new Error("redis client referenced before creation.");

    return instance;
}