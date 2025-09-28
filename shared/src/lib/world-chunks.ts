export function getChunkCoordinates(squareX: number, squareY: number) {
    return {
        x: Math.floor(squareX / 8),
        y: Math.floor(squareY / 8)
    };
}