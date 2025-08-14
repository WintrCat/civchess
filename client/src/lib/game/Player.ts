import { Sprite, Assets } from "pixi.js";

import whiteKing from "@assets/white_king.webp?url";

export async function createPlayer() {
    const player = new Sprite(
        await Assets.load(whiteKing)
    );

    player.scale.set(80 / 256);

    return player;
}