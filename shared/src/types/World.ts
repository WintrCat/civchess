import { Chunk } from "./Chunk";

export interface World {
    name: string;
    chunks: Chunk[][];
}