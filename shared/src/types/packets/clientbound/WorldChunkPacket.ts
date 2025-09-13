import { Chunk } from "@/types/world/Chunk";

export interface WorldChunkPacket {
    x: number;
    y: number;
    chunk: Chunk;
}