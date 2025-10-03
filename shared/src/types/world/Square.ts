import z from "zod";

import { SquareType } from "@/constants/SquareType";
import { playerSchema } from "./Player";
import { pieceSchema } from "./Piece";

export const squareSchema = z.object({
    type: z.enum(SquareType),
    piece: z.union([ playerSchema, pieceSchema ]).optional()
});

export type Square = z.infer<typeof squareSchema>;