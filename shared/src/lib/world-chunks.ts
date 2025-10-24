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

interface BoundsOptions {
    radius?: number;
    max?: number;
    includeCenter?: boolean;
}

export function getSurroundingBounds(
    x: number,
    y: number,
    opts?: Omit<BoundsOptions, "includeCenter">
) {
    const radius = opts?.radius || 1;
    const maxCoord = opts?.max || Infinity;

    return {
        startX: Math.max(0, x - radius),
        startY: Math.max(0, y - radius),
        endX: Math.min(maxCoord - 1, x + radius),
        endY: Math.min(maxCoord - 1, y + radius)
    };
}

export function* getSurroundingPositions(
    originX: number,
    originY: number,
    opts?: BoundsOptions
) {
    const bounds = getSurroundingBounds(originX, originY, opts);

    for (let y = bounds.startY; y <= bounds.endY; y++) {
        for (let x = bounds.startX; x <= bounds.endX; x++) {
            if (
                !opts?.includeCenter
                && x == originX
                && y == originY
            ) continue;

            yield { x, y };
        }
    }
}