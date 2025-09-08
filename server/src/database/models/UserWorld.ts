import { Schema, Types, model } from "mongoose";

import { World, WorldMetadata } from "shared/types/world/World";
import { Collection } from "@/constants/Collection";

export interface UserWorld extends World {
    userId: Types.ObjectId;
}

export interface UserWorldMetadata extends WorldMetadata {
    userId: Types.ObjectId;
}

const worldSchema = new Schema<UserWorld>({}, { strict: false });

export const UserWorld = model("world", worldSchema, Collection.WORLDS);