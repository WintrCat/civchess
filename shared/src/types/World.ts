import z from "zod";

import { Chunk } from "./Chunk";
import { SquareType } from "@/constants/SquareType";

export interface World {
    name: string;
    code: string;
    pinned: boolean;
    chunks: Chunk[][];
    createdAt: string;
    lastOnlineAt?: string;
}

export type WorldMetadata = Omit<World, "chunks">;

export const worldOptionsSchema = z.object({
    name: z.string()
        .min(1, "World name cannot be empty.")
        .max(32, "World name must be 32 characters or less."),
    code: z.string()
        .min(3, "World Code must be at least 3 characters.")
        .max(24, "World Code must be 24 characters or less."),
    pinned: z.boolean().optional(),
    squareTypes: z.enum(SquareType).array().optional()
});

export type WorldOptions = z.infer<typeof worldOptionsSchema>;

export function toWorldMetadata(world: World): WorldMetadata {
    return {
        code: world.code,
        name: world.name,
        pinned: world.pinned,
        createdAt: world.createdAt,
        lastOnlineAt: world.lastOnlineAt
    };
}