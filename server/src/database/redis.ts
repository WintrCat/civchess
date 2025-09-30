import { Redis } from "ioredis";

type ObjectValue = string | number | boolean | object;

class ExtendedRedis extends Redis {
    private async getNumericalResponse(
        command: string,
        key: string,
        path: string
    ) {
        const response = await this.call(command, key, path);
        if (!Array.isArray(response)) return 0;

        return Number(response.at(0)) || 0;
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