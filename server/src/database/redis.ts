import { Redis } from "ioredis";

type ObjectValue = string | number | object;

class ExtendedRedis extends Redis {
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

        length: async (key: string, path: string) => {
            const lengthResponse = await this.call("json.arrlen", key, path);
            if (!Array.isArray(lengthResponse)) return 0;

            return Number(lengthResponse.at(0)) || 0;
        },

        push: async <Val extends ObjectValue>(
            key: string,
            path: string,
            value: Val,
            defaultArray?: Val[]
        ) => {
            if (defaultArray)
                await this.json.set(key, path, defaultArray, "NX");

            await this.call(
                "json.arrappend", key, path, JSON.stringify(value)
            );
        },

        remove: async (key: string, path: string, value: ObjectValue) => {
            const indexResponse = await this.call(
                "json.arrindex", key, path, JSON.stringify(value)
            );
            if (!Array.isArray(indexResponse)) return false;

            const index = indexResponse.at(0);
            if (typeof index != "number") return false;

            await this.call("json.arrpop", key, path, index);

            return true;
        }
    };
}

let instance: ExtendedRedis | null = null;

export function connectRedisClient() {
    if (!process.env.REDIS_DATABASE_URI)
        return console.log("redis database uri not specified.");

    const parsedURI = new URL(process.env.REDIS_DATABASE_URI);

    return instance = new ExtendedRedis({
        host: parsedURI.hostname,
        port: Number(parsedURI.port)
    }).on("error", err => {
        console.log("failed to connect to redis database:");
        console.log(err);
    });
}

export function getRedisClient() {
    if (!instance)
        throw new Error("redis client referenced before creation.");

    return instance;
}