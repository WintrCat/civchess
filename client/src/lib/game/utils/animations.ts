import { Action } from "pixi-actions";

import { GameClient } from "../Client";

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