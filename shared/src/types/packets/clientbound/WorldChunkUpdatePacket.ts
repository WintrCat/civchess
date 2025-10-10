import { RuntimeChunk } from "@/types/world/OnlineWorld";
import { Square } from "@/types/world/Square";

type Changes<T extends object> = {
    [K in keyof T]?: T[K] | null
};

export interface WorldChunkUpdatePacket {
    x: number;
    y: number;
    changes?: Record<string, Changes<Square>>;
    runtimeChanges?: Changes<RuntimeChunk>;
}