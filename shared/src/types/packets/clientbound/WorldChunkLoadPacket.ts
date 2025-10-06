import { Chunk } from "@/types/world/Chunk";
import { RuntimeChunk } from "@/types/world/OnlineWorld";

export interface WorldChunkLoadPacket {
    x: number;
    y: number;
    chunk: Chunk;
    runtimeChunk: RuntimeChunk;
}