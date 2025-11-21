import { readFileSync } from "fs";
import { ChainableCommander, Redis, RedisValue } from "ioredis";

export type ObjectValue = string | number | boolean | object;

function buildJsonExtension(commander: ExtendedRedis | ChainableCommander) {
    const getNumericalResponse = async (
        command: string,
        ...args: RedisValue[]
    ) => {
        let response = await commander.call(command, ...args);

        if (typeof response == "string") try {
            response = JSON.parse(String(response));
        } catch {}

        if (!Array.isArray(response)) return NaN;

        return Number(response.at(0));
    };

    return {
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
                await commander.call(...args, modifier);
            } else {
                await commander.call(...args);
            }
        },

        get: async <Val extends ObjectValue>(
            key: string, path: string
        ) => {
            try {
                const response = await commander.call("json.get", key, path);

                const matches = JSON.parse(String(response));
                if (!Array.isArray(matches)) return null;

                return matches.at(0) as Val || null;
            } catch {
                return null;
            }
        },

        incr: async (key: string, path: string, amount: number) => {
            return await getNumericalResponse(
                "json.numincrby", key, path, amount
            );
        },

        delete: async (key: string, path: string) => {
            return await getNumericalResponse("json.del", key, path);
        },

        exists: async (key: string, path: string) => {
            const response = await commander.call("json.type", key, path);
            
            return Array.isArray(response) && response.length > 0;
        },

        length: async (key: string, path: string) => {
            return await getNumericalResponse("json.arrlen", key, path);
        },

        move: async (key: string, path: string, newPath: string) => {
            if (!("moveScript" in commander)) return;
            if (!commander.moveScript) return;

            await commander.evalsha(commander.moveScript,
                1, key, path, newPath
            );
        }
    };
}

class ExtendedRedis extends Redis {
    moveScript?: string;

    json = buildJsonExtension(this);

    async loadScripts() {
        const scriptsFolder = "server/src/database/scripts";

        this.moveScript = String(
            await this.script("LOAD", readFileSync(
                `${scriptsFolder}/move.lua`, "utf-8"
            ))
        );
    }

    createTransaction() {
        const multi = this.multi();

        return Object.assign(multi,
            this,
            { json: buildJsonExtension(multi) }
        );
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