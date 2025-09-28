import { SquareType } from "shared/constants/SquareType";

export const squareSize = 80;

export const chunkSquareCount = 8;
export const chunkSize = squareSize * chunkSquareCount;

export const biomeNames = {
    [SquareType.GRASSLAND]: "Grassland",
    [SquareType.DESERT]: "Desert",
    [SquareType.OCEAN]: "Ocean"
};

export const squareColours = {
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