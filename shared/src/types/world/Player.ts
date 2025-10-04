import z from "zod";

export const playerSchema = z.object({
    x: z.int(),
    y: z.int(),
    colour: z.string(),
    inventory: z.string().array()
});

export type Player = z.infer<typeof playerSchema>;