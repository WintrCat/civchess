import { Collection } from "@/constants/Collection";
import { Schema, Types, model } from "mongoose";

import { World } from "shared/types/game/World";

interface UserWorld extends World {
    userId: Types.ObjectId;
}

const worldSchema = new Schema<UserWorld>({}, { strict: false });

export const UserWorld = model("world", worldSchema, Collection.WORLDS);