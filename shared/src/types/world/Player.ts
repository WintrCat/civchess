import z from "zod";

export const playerSchema = z.object({
    x: z.number(),
    y: z.number(),
    colour: z.string(),
    inventory: z.string().array()
});

export type Player = z.infer<typeof playerSchema>;