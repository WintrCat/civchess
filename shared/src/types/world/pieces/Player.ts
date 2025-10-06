import z from "zod";

import { PieceType } from "@/constants/PieceType";

export const playerPieceSchema = z.object({
    id: z.literal(PieceType.PLAYER),

    userId: z.string(),
    username: z.string(),
    colour: z.string(),
    health: z.int()
});

export type PlayerPiece = z.infer<typeof playerPieceSchema>;