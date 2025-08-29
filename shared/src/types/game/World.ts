import z from "zod";

import { Chunk } from "./Chunk";
import { SquareType } from "@/constants/SquareType";

// change server related options (bans, ops etc.) while in game
interface WorldServer {
    lastOnlineAt?: string;
    maxPlayers?: number;
    bannedPlayers: string[];
    whitelistedPlayers?: string[];
    operatorPlayers: string[];
}

interface OnlineWorldServer extends WorldServer {
    connectedPlayers: string[]; // to be a Player object
}

export interface World {
    name: string;
    code: string;
    pinned: boolean;
    chunks: Chunk[][];
    createdAt: string;
    server: WorldServer;
}

export type OnlineWorld = (
    Omit<World, "server">
    & { server: OnlineWorldServer }
);

export type WorldMetadata = Omit<World, "chunks" | "server"> & {
    server: {
        lastOnlineAt?: string;
        maxPlayers?: number;
        online: boolean;
    }
};

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