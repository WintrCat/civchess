import z from "zod";

export const playerSchema = z.object({
    userId: z.string(),
    x: z.int(),
    y: z.int(),
    colour: z.string(),
    inventory: z.string().array(),
    health: z.int(),
});

export type Player = z.infer<typeof playerSchema>;