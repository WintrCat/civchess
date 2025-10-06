import z from "zod";

import { SquareType } from "@/constants/SquareType";
import { pieceSchema } from "./Piece";

export const squareSchema = z.object({
    type: z.enum(SquareType),
    piece: pieceSchema.optional()
});

export type Square = z.infer<typeof squareSchema>;