import { Graphics } from "pixi.js";

export function* createMap() {
    for (let x = 0; x < 8; x++) {
        for (let y = 0; y < 8; y++) {
            const graphics = new Graphics()
                .rect(x * 80, y * 80, 80, 80)
                .fill((x + y) % 2 == 0 ? "#ebedd1" : "#729452");

            graphics.cullable = true;

            yield graphics;
        }
    }
}