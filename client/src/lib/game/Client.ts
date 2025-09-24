import { Application, Assets, ColorSource } from "pixi.js";
import { Viewport } from "pixi-viewport";

import { pieceImages } from "@/constants/utils";
import { SocketClient } from "./SocketClient";
import { Player } from "./entity/Player";

interface GameClientConfig {
    backgroundColour: ColorSource;
    viewportPadding: number;
}

export class GameClient {
    container: HTMLDivElement;
    app: Application;
    viewport?: Viewport;
    socket: SocketClient;

    worldChunkSize?: number;
    localPlayer?: Player;

    config: GameClientConfig = {
        backgroundColour: "#ffffff",
        viewportPadding: 160
    };

    constructor(container: HTMLDivElement) {
        if (!import.meta.env.PUBLIC_ORIGIN)
            throw new Error("backend origin not specified.");

        this.container = container;

        this.app = new Application();

        this.socket = new SocketClient(this,
            import.meta.env.PUBLIC_ORIGIN,
            { path: "/api/socket", transports: ["websocket"] }
        );
    }

    async init() {
        await this.app.init({
            background: this.config.backgroundColour,
            resizeTo: this.container,
            preference: "webgpu"
        });

        const viewport = new Viewport({
            screenWidth: this.app.renderer.width,
            screenHeight: this.app.renderer.height,
            events: this.app.renderer.events
        })
            .drag()
            .decelerate({ friction: 0.85 })
            .pinch()
            .wheel()
            .clampZoom({ maxScale: 3, minScale: 1 });

        viewport.eventMode = "static";
        viewport.scale = 2;

        this.viewport = viewport;

        for (const pieceImage of Object.values(pieceImages))
            await Assets.load(pieceImage);

        this.app.stage.addChild(viewport);
        this.container.appendChild(this.app.canvas);

        return this as InitialisedGameClient;
    }

    joinWorld(worldCode: string, sessionToken: string) {
        this.socket.sendPacket("playerJoin", { worldCode, sessionToken });
    }
}

export type InitialisedGameClient = (
    Omit<GameClient, "viewport">
    & { viewport: Viewport }
);