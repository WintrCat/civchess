import { RuntimeChunk } from "@/types/world/OnlineWorld";
import { Square } from "@/types/world/Square";

export interface WorldChunkUpdatePacket {
    x: number;
    y: number;
    changes?: Record<string, Partial<Square>>;
    runtimeChanges?: RuntimeChunk;    
}