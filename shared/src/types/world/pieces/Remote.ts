import z from "zod";

import { PieceType } from "@/constants/PieceType";
import { RemotePieceType } from "@/constants/PieceType";

export const remotePieceSchema = z.object({
    id: z.literal(PieceType.REMOTE),
    
    type: z.enum(RemotePieceType),
    colour: z.string(),
    owner: z.string()
});

export type RemotePiece = z.infer<typeof remotePieceSchema>;