import { LocalSquare } from "../world/LocalSquare";

export const moveSound = new Audio("/audio/move.mp3");
export const captureSound = new Audio("/audio/capture.mp3");
export const attackSound = new Audio("/audio/attack.mp3");

export function playMoveSound(toSquare: LocalSquare) {
    if (toSquare.entity) return captureSound.play();
    moveSound.play();
}