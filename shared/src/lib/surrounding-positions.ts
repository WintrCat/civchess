interface BoundsOptions {
    originX: number;
    originY: number;
    radius?: number;
    min?: number;
    max?: number;
}

export interface SurroundingPointsOptions extends BoundsOptions {
    includeCenter?: boolean;
    differenceFrom?: BoundsOptions;
}

function getSurroundingBounds(opts: BoundsOptions) {
    const radius = opts.radius || 1;

    const minCoord = opts.min || 0;
    const maxCoord = opts.max || Infinity;

    return {
        startX: Math.max(minCoord, opts.originX - radius),
        startY: Math.max(minCoord, opts.originY - radius),
        endX: Math.min(maxCoord - 1, opts.originX + radius),
        endY: Math.min(maxCoord - 1, opts.originY + radius)
    };
}

/**
 * @description Bounds options for differenceFrom will be taken
 * from the main options object where not overridden.
 */
export function* getSurroundingPoints(opts: SurroundingPointsOptions) {
    const previousBounds = opts.differenceFrom
        && getSurroundingBounds({ ...opts, ...opts.differenceFrom });

    const bounds = getSurroundingBounds(opts);

    for (let y = bounds.startY; y <= bounds.endY; y++) {
        for (let x = bounds.startX; x <= bounds.endX; x++) {
            if (
                !opts?.includeCenter
                && x == opts.originX
                && y == opts.originY
            ) continue;

            if (
                previousBounds
                && x >= previousBounds.startX && x <= previousBounds.endX
                && y >= previousBounds.startY && y <= previousBounds.endY
            ) continue;

            yield { x, y };
        }
    }
}