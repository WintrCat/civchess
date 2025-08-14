import { sample } from "es-toolkit";

import { SquareType } from "shared/constants/SquareType";
import { Square } from "shared/types/Square";
import { World } from "shared/types/World";

interface WorldOptions {
    name: string;
    seed: number;
    width: number;
    height: number;
    squareTypes?: SquareType[];
}

export function generateWorld(options: WorldOptions): World {
    const squares: Square[][] = [];

    for (let y = 0; y < options.height; y++) {
        const row: Square[] = [];

        for (let x = 0; x < options.width; x++) {
            row.push({
                type: sample(options.squareTypes || Object.values(SquareType))
            });
        }
        
        squares.push(row);
    }

    return { name: options.name, squares };
}