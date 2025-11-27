import { Action } from "pixi-actions";

import { GameClient } from "../Client";
import { ColorMatrixFilter, EffectsMixin } from "pixi.js";

export async function animateAsync(
    client: GameClient,
    action: Action,
    onDone?: () => void
) {
    return new Promise<void>(res => {
        const animation = action.play();

        const animationTicker = () => {
            if (!animation.done) return;

            client.app.ticker.remove(animationTicker);
            onDone?.();
            res();
        };

        client.app.ticker.add(animationTicker);
    });
}

export function setBrightness(
    graphics: EffectsMixin,
    brightnessMultiplier: number | null
) {
    if (brightnessMultiplier == null)
        return graphics.filters = null;

    const filter = new ColorMatrixFilter();
    filter.brightness(brightnessMultiplier, true);

    graphics.filters = [filter];
}