import z from "zod";

import { PieceType } from "@/constants/PieceType";

export const playerPieceSchema = z.object({
    id: z.literal(PieceType.PLAYER),

    colour: z.string(),
    username: z.string(),
    health: z.int()
});

export type Player = z.infer<typeof playerPieceSchema>;