import { coordinateIndex, chunkSquareCount } from "./world-chunks";

interface Coordinate {
    x: number;
    y: number;
}

class LegalMoveSet {
    private items: Set<string>;

    constructor(moves: Coordinate[]) {
        this.items = new Set(moves.map(
            move => coordinateIndex(move.x, move.y)
        ));
    }

    has(x: number, y: number) {
        return this.items.has(coordinateIndex(x, y));
    }
}

export function getLegalKingMoves(
    originX: number,
    originY: number,
    worldChunkSize?: number
) {
    const legalMoves: Coordinate[] = [];

    const worldSquareSize = worldChunkSize
        ? worldChunkSize * chunkSquareCount
        : Infinity;

    const coords = {
        startX: Math.max(0, originX - 1),
        startY: Math.max(0, originY - 1),
        endX: Math.min(worldSquareSize - 1, originX + 1),
        endY: Math.min(worldSquareSize - 1, originY + 1)
    };

    for (let y = coords.startY; y <= coords.endY; y++) {
        for (let x = coords.startX; x <= coords.endX; x++) {
            if (x == originX && y == originY) continue;

            legalMoves.push({ x, y });
        }
    }

    return new LegalMoveSet(legalMoves);
}