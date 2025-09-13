import { HydratedDocument, RootFilterQuery } from "mongoose";
import { mapValues, omit } from "es-toolkit";
import z from "zod";

import {
    World,
    WorldMetadata,
    worldMetadataSchema,
    worldSchema
} from "shared/types/world/World";
import { UserWorld } from "@/database/models/UserWorld";
import { isWorldOnline } from "./server";

// Projection type for selecting properties in query
type WorldSelection = { [K in keyof UserWorld]?: true }
    | { [K in keyof UserWorld]?: false };

// UserWorld with an applied projection (empty object = select all)
type PartialWorld<S extends WorldSelection> = (keyof S extends never
    ? UserWorld
    : (S[keyof S] extends true
        ? Pick<UserWorld, keyof UserWorld & keyof S>
        : Omit<UserWorld, keyof UserWorld & keyof S>
    )
);

// Check if a world exists
export async function worldExists(
    filter?: RootFilterQuery<UserWorld>
) {
    const world = await UserWorld.exists(filter || {});
    return !!world;
}

// Fetch multiple worlds
export function fetchWorlds<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocuments?: false,
    limit?: number
): Promise<PartialWorld<Selection>[]>;

export function fetchWorlds<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocuments?: true,
    limit?: number
): Promise<HydratedDocument<PartialWorld<Selection>>[]>;

export async function fetchWorlds<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocuments?: Full,
    limit?: number
) {
    const worldsQuery = UserWorld.find(filter || {})
        .select(mapValues(selection || {}, val => Number(val)))
        .limit(limit || 0);

    if (!fullDocuments) {
        const worlds = await worldsQuery.lean();
        return worlds.map(world => omit(world, ["__v", "_id"]));
    }

    return (
        await worldsQuery
    ) as any as HydratedDocument<PartialWorld<Selection>>[];
}

// Fetch singular world
export function fetchWorld<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocument?: false
): Promise<PartialWorld<Selection> | null>;

export function fetchWorld<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocument?: true
): Promise<HydratedDocument<PartialWorld<Selection>> | null>;

export async function fetchWorld<
    Selection extends WorldSelection = {},
    Full extends boolean = false
>(
    filter?: RootFilterQuery<UserWorld>,
    selection?: Selection,
    fullDocument?: Full
) {
    const worlds = fullDocument
        ? await fetchWorlds(filter, selection, true, 1)
        : await fetchWorlds(filter, selection, false, 1);

    return worlds.at(0) || null;
}

// Fetch world metadatas (predefined selection)
const nativeMetadataSchema = worldMetadataSchema.omit({ online: true });
type NativeMetadata = z.infer<typeof nativeMetadataSchema>;

export async function fetchWorldMetadatas(
    filter?: RootFilterQuery<UserWorld>
): Promise<WorldMetadata[]> {
    const nativeMetadataSelection = (
        mapValues(nativeMetadataSchema.shape, () => true)
    ) as { [K in keyof NativeMetadata]-?: true };

    const nativeMetadatas: NativeMetadata[] = await fetchWorlds(
        filter, nativeMetadataSelection
    );

    return await Promise.all(
        nativeMetadatas.map(async metadata => ({
            ...metadata,
            online: await isWorldOnline(metadata.code)
        }))
    );
}

// Convert UserWorld etc. to base World
export function toBaseWorld<T extends World>(world: T): World {
    return worldSchema.safeParse(world).data!;
}