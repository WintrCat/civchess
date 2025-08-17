import { Sprite, Assets } from "pixi.js";

import whiteKing from "@assets/img/white_king.webp";

export async function createPlayer() {
    const player = new Sprite(
        await Assets.load(whiteKing)
    );

    player.scale.set(80 / 256);

    return player;
}