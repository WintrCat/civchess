import { ChunkLayer } from "@/types/world/OnlineWorld";

export interface PieceMovePacket {
    layer: ChunkLayer;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}