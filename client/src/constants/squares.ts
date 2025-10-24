import { ColorSource } from "pixi.js";

import { SquareType } from "shared/constants/SquareType";
import { chunkSquareCount } from "shared/lib/world-chunks";

export const squareSize = 80;
export const chunkSize = squareSize * chunkSquareCount;

export const renderDistance = (
    Number(import.meta.env.PUBLIC_RENDER_DISTANCE) || 2
);

export const biomeNames = {
    [SquareType.GRASSLAND]: "Grassland",
    [SquareType.DESERT]: "Desert",
    [SquareType.OCEAN]: "Ocean"
};

type SquareColours = Record<
    SquareType,
    Record<"light" | "dark", ColorSource>
>;

export const squareColours: SquareColours = {
    [SquareType.GRASSLAND]: {
        light: "#aadaa0ff",
        dark: "#7eac54"
    },
    [SquareType.DESERT]: {
        light: "#e3d46f",
        dark: "#c0b468"
    },
    [SquareType.OCEAN]: {
        light: "#24afff",
        dark: "#2095daff"
    }
};