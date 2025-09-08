import z from "zod";

import { squareSchema } from "./Square";

export const chunkSchema = z.object({
    squares: squareSchema.array().array()
});

export type Chunk = z.infer<typeof chunkSchema>;