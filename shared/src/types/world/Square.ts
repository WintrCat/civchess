import z from "zod";

import { SquareType } from "@/constants/SquareType";
import { playerPieceSchema } from "./pieces/PlayerPiece";
import { remotePieceSchema } from "./pieces/RemotePiece";

export const squareSchema = z.object({
    type: z.enum(SquareType),
    piece: z.union([
        playerPieceSchema,
        remotePieceSchema
    ]).optional()
});

export type Square = z.infer<typeof squareSchema>;