import z from "zod";

import { worldSchema } from "shared/types/world/World";
import { chunkSchema } from "shared/types/world/Chunk";

export const onlineChunkSchema = chunkSchema.extend({
    subscribers: z.record(z.string(), z.literal(true))
});

export const onlineWorldSchema = worldSchema.extend({
    chunks: onlineChunkSchema.array().array()
});

export type OnlineChunk = z.infer<typeof onlineChunkSchema>;
export type OnlineWorld = z.infer<typeof onlineWorldSchema>;