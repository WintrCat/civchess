import z from "zod";

import { playerPieceSchema } from "./pieces/Player";
import { remotePieceSchema } from "./pieces/Remote";

export const pieceSchema = z.union([
    playerPieceSchema,
    remotePieceSchema
]);

export type Piece = z.infer<typeof pieceSchema>;