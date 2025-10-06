export const chunkSquareCount = 8;

export function getChunkCoordinates(squareX: number, squareY: number) {
    return {
        chunkX: Math.floor(squareX / chunkSquareCount),
        chunkY: Math.floor(squareY / chunkSquareCount),
        relativeX: squareX % chunkSquareCount,
        relativeY: squareY % chunkSquareCount
    };
}