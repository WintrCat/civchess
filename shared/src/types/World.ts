import z from "zod";

import { Chunk } from "./Chunk";
import { SquareType } from "@/constants/SquareType";

export interface World {
    name: string;
    id: string;
    chunks: Chunk[][];
}

export const worldOptionsSchema = z.object({
    name: z.string().min(3).max(32),
    id: z.string().min(3).max(24),
    widthChunks: z.number().min(1),
    heightChunks: z.number().min(1),
    squareTypes: z.enum(SquareType).array().optional()
});

export type WorldOptions = z.infer<typeof worldOptionsSchema>;