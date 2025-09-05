import { Redis } from "ioredis";

let instance: Redis;

export function createRedisClient(uri: string) {
    const parsedURI = new URL(uri);

    return instance = new Redis({
        host: parsedURI.hostname,
        port: Number(parsedURI.port)
    }).on("error", err => {
        console.log("failed to connect to redis database:");
        console.log(err);
    });
}

export function getRedisClient() {
    return instance;
}