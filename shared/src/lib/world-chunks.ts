export const chunkSquareCount = 8;

export function getChunkCoordinates(squareX: number, squareY: number) {
    return {
        x: Math.floor(squareX / chunkSquareCount),
        y: Math.floor(squareY / chunkSquareCount)
    };
}