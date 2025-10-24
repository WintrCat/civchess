import { Point } from "pixi.js";

import { PieceType } from "shared/constants/PieceType";
import { PublicProfile } from "shared/types/PublicProfile";
import { coordinateIndex, getChunkCoordinates } from "shared/lib/world-chunks";
import { PlayerPiece } from "shared/types/world/pieces/Player";
import { Piece } from "shared/types/world/Piece";
import { GameClient } from "../Client";
import { LocalChunk } from "./LocalChunk";
import { Player } from "../entity/Player";

export class LocalWorld {
    client: GameClient;

    // Coordinate Index -> Local Chunk 
    localChunks: Record<string, LocalChunk> = {};
    chunkSize?: number;

    // User ID -> Public Profile
    playerlist: Record<string, PublicProfile> = {};
    localPlayer?: Player;

    constructor(client: GameClient) {
        this.client = client;
    }

    // Manage chunks
    setLocalChunk(
        chunkX: number,
        chunkY: number,
        chunk: LocalChunk | undefined
    ) {
        const coordIndex = coordinateIndex(chunkX, chunkY);

        if (chunk) {
            this.localChunks[coordIndex] = chunk;
        } else {
            this.localChunks[coordIndex]?.unload();
            delete this.localChunks[coordIndex];
        }
    }

    getLocalChunk(chunkX: number, chunkY: number) {
        return this.localChunks[coordinateIndex(chunkX, chunkY)];
    }

    getSquareLocalChunk(squareX: number, squareY: number) {
        const { chunkX, chunkY } = getChunkCoordinates(squareX, squareY);
        return this.getLocalChunk(chunkX, chunkY);
    }

    // Manage squares
    getLocalSquare(squareX: number, squareY: number) {
        const { chunkX, chunkY, relativeX, relativeY } = (
            getChunkCoordinates(squareX, squareY)
        );

        const chunk = this.getLocalChunk(chunkX, chunkY);

        return chunk?.squares.at(relativeY)?.at(relativeX);
    }

    // Utils
    isLocalPlayer(piece: Piece): piece is PlayerPiece {
        return piece.id == PieceType.PLAYER
            && piece.userId == this.localPlayer?.userId;
    }

    pieceToEntity(x: number, y: number, piece: Piece) {
        if (!this.client.isInitialised()) throw new Error(
            "cannot create entities before client is initialised."
        );

        const position = new Point(x, y);

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