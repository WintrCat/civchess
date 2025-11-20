export const chunkSquareCount = 8;

export function coordinateIndex(index: string): { x: number, y: number };
export function coordinateIndex(x: number, y: number): string;

export function coordinateIndex(x: number | string, y?: number) {
    if (typeof x == "string") {
        const parts = x.split(",");
        return { x: Number(parts[0]), y: Number(parts[1]) };
    } else {
        return `${x},${y}`;
    }
}

export function getChunkCoordinates(squareX: number, squareY: number) {
    return {
        chunkX: Math.floor(squareX / chunkSquareCount),
        chunkY: Math.floor(squareY / chunkSquareCount),
        relativeX: squareX % chunkSquareCount,
        relativeY: squareY % chunkSquareCount
    };
}