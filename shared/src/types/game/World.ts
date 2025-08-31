import z from "zod";

import { chunkSchema } from "./Chunk";
import { SquareType } from "@/constants/SquareType";

// change server related options (bans, ops etc.) while in game
export const worldSchema = z.object({
    name: z.string(),
    code: z.string(),
    pinned: z.boolean(),
    createdAt: z.iso.datetime(),

    lastOnlineAt: z.string().optional(),
    maxPlayers: z.number().optional(),
    bannedPlayers: z.string().array(),
    whitelistedPlayers: z.string().array().optional(),
    operatorPlayers: z.string().array(),

    chunks: chunkSchema.array().array(),
    players: z.string().array(), // To be Player object array
});

export type World = z.infer<typeof worldSchema>;

// World metadata for world listings
export const worldMetadataSchema = worldSchema.pick({
    name: true,
    code: true,
    pinned: true,
    createdAt: true,
    lastOnlineAt: true,
    maxPlayers: true
}).extend({ online: z.boolean() });

export type WorldMetadata = z.infer<typeof worldMetadataSchema>;

// World options for world generation
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