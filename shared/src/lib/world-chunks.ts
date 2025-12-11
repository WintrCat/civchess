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
    const chunkX = Math.floor(squareX / chunkSquareCount);
    const chunkY = Math.floor(squareY / chunkSquareCount);

    // Ensure relative coordinates are always in the range
    // [0, chunkSquareCount - 1], even for negative square coords.
    //
    // Note: JavaScript's `%` operator returns a negative remainder for
    // negative inputs (e.g. `-1 % 8 === -1`). That would produce
    // negative in-chunk indices for negative coordinates. To avoid that,
    // we compute the chunk with `Math.floor` and then subtract the
    // chunk's start (`chunk * chunkSquareCount`) from the absolute
    // coordinate. This guarantees `relativeX`/`relativeY` are always
    // non-negative and in the range [0, chunkSquareCount - 1].
    const relativeX = squareX - (chunkX * chunkSquareCount);
    const relativeY = squareY - (chunkY * chunkSquareCount);

    return { chunkX, chunkY, relativeX, relativeY };
}