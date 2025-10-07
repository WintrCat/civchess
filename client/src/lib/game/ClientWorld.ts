import { PublicProfile } from "shared/types/PublicProfile";
import { RuntimeChunk } from "shared/types/world/OnlineWorld";
import { Chunk } from "shared/types/world/Chunk";
import { Player } from "shared/types/world/Player";
import { Player as PlayerEntity } from "./entity/Player";

interface CachedChunk {
    persistent: Chunk;
    runtime: RuntimeChunk;
}

export class ClientWorld {
    chunkSize?: number;
    chunkCache: CachedChunk[][] = [];

    playerlist: PublicProfile[] = [];

    localPlayer?: {
        entity: PlayerEntity;
        data: Player;
    };

    setChunkCache(x: number, y: number, cachedChunk: CachedChunk) {
        this.chunkCache[y] ??= [];
        this.chunkCache[y][x] = cachedChunk;
    }

    getChunkCache(x: number, y: number) {
        return this.chunkCache.at(y)?.at(x);
    }
}