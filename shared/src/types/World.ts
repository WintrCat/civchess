import z from "zod";

import { Chunk } from "./Chunk";
import { SquareType } from "@/constants/SquareType";

export interface World {
    name: string;
    id: string;
    chunks: Chunk[][];
}

export const worldOptionsSchema = z.object({
    name: z.string()
        .min(1, "World name cannot be empty.")
        .max(32, "World name must be 32 characters or less."),
    id: z.string()
        .min(3, "World ID must be at least 3 characters.")
        .max(24, "World ID must be 24 characters or less."),
    widthChunks: z.number().min(1),
    heightChunks: z.number().min(1),
    squareTypes: z.enum(SquareType).array().optional()
});

export type WorldOptions = z.infer<typeof worldOptionsSchema>;