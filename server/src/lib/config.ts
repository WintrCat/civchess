import z from "zod";
import yaml from "yaml";
import { readFileSync } from "fs";

import { UserRole } from "shared/constants/UserRole";

const configSchema = z.object({
    autosaveInterval: z.int().min(1),
    chunkSize: z.int().min(1),
    renderDistance: z.int().min(1),
    worldCreatorRoles: z.enum(UserRole).or(z.literal("all")).array(),
    maxPlayerHealth: z.int().min(1) 
});

export const config: z.infer<typeof configSchema> = (
    yaml.parse(readFileSync("./config.yaml", "utf-8"))
);

export function validateConfig() {
    const parse = configSchema.safeParse(config);
    if (parse.success) return;

    const issues = parse.error.issues.map((issue, index) => (
        `[${++index}]: ${JSON.stringify(issue, undefined, 2)}`
    )).join("\n");

    throw new Error(`config load failed with issues:\n${issues}`);
}