import z from "zod";

export const pieceSchema = z.object({
    x: z.int(),
    y: z.int(),
    type: z.enum([ "p", "b", "n", "k", "q" ]),
    colour: z.string(),
    owner: z.string()
});

export type Piece = z.infer<typeof pieceSchema>;