import { createClient } from "redis";

export const redisClient = await createClient({
    url: process.env.REDIS_DATABASE_URI
})
    .on("error", () => console.log(
        "failed to connect to redis database."
    ))
    .connect();