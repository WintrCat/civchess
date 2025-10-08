import { Point } from "pixi.js";

import { PieceType } from "shared/constants/PieceType";
import { PublicProfile } from "shared/types/PublicProfile";
import { coordinateIndex } from "shared/types/world/OnlineWorld";
import { PlayerPiece } from "shared/types/world/pieces/Player";
import { Piece } from "shared/types/world/Piece";
import { LocalChunk } from "./types/chunks";
import { Player } from "./entity/Player";
import { GameClient } from "./Client";

export class LocalWorld {
    client: GameClient;

    chunkSize?: number;
    localChunks: LocalChunk[][] = [];

    // User ID -> Public Profile
    playerlist: Record<string, PublicProfile> = {};

    localPlayer?: Player;

    constructor(client: GameClient) {
        this.client = client;
    }

    isLocalPlayer(piece: Piece): piece is PlayerPiece {
        return piece.id == PieceType.PLAYER
            && piece.userId == this.localPlayer?.userId;
    }

    setLocalChunk(x: number, y: number, localChunk: LocalChunk) {
        this.localChunks[y] ??= [];
        this.localChunks[y][x] = localChunk;
    }

    getLocalChunk(x: number, y: number) {
        return this.localChunks.at(y)?.at(x);
    }

    getRuntimeSquare(chunk: LocalChunk, x: number, y: number) {
        return chunk.runtimeSquares[coordinateIndex(x, y)];
    }

    pieceToEntity(position: Point, piece: Piece) {
        if (!this.client.isInitialised()) throw new Error(
            "cannot create entities before client is initialised."
        );

        if (piece.id == PieceType.PLAYER) {
            return new Player({
                client: this.client,
                position: position,
                userId: piece.userId,
                colour: piece.colour,
                health: piece.health
            });
        }
    
        throw new Error("piece type entity not implemented yet.");
    }
}