import { Application, Sprite } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { createMap } from "./Map";
import { createPlayer } from "./Player";

let heldPlayer: Sprite | undefined;

export async function loadApplication(root: HTMLElement) {
    const app = new Application();
    
    await app.init({
        background: "#a1a1a1",
        resizeTo: window,
        preference: "webgpu"
    });

    const viewport = new Viewport({
        screenWidth: innerWidth,
        screenHeight: innerHeight,
        worldWidth: 10000,
        worldHeight: 10000,
        events: app.renderer.events
    })
        .drag()
        .pinch()
        .wheel()
        .clampZoom({ maxScale: 3, minScale: 1 })
        .clamp({
            left: -160,
            right: 10000,
            top: -160,
            bottom: 10000
        });

    viewport.eventMode = "static";
    viewport.scale = 2;

    app.stage.addChild(viewport);

    createMap().forEach(square => viewport.addChild(square));
    
    const player = await createPlayer();
    player.eventMode = "static";
    player.position.set(40, 40);
    player.anchor = 0.5;

    player.on("pointerdown", event => {
        heldPlayer = player;

        player.scale.set(90 / 256);
        player.position = viewport.toWorld(event.global);

        viewport.plugins.pause("drag");
    });

    viewport.on("pointermove", event => {
        if (!heldPlayer) return;
        heldPlayer.position = viewport.toWorld(event.global);
    });

    function stopPlayerDrag() {
        heldPlayer = undefined;
        player.scale.set(80 / 256);
        player.position.set(
            Math.floor(player.position.x / 80) * 80 + 40,
            Math.floor(player.position.y / 80) * 80 + 40
        )

        viewport.plugins.resume("drag");
    }

    player.on("pointerup", stopPlayerDrag);
    player.on("pointerupoutside", stopPlayerDrag);

    viewport.addChild(player);

    root.appendChild(app.canvas);
}