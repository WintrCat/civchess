import { Application, Assets } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Actions } from "pixi-actions";

import { pieceImages } from "@/constants/utils";
import { InterfaceClient, UIHooks } from "./InterfaceClient";
import { SocketClient } from "./SocketClient";
import { LocalWorld } from "./world/LocalWorld";
import { clampViewportAroundSquare } from "./utils/viewport";
import { AuthInfer } from "../auth";

interface GameClientOptions {
    container: HTMLElement;
    account: AuthInfer;
}

export class GameClient {
    container: HTMLElement;
    app: Application;
    account: AuthInfer;

    viewport?: Viewport;
    socket: SocketClient;
    ui: InterfaceClient;

    world = new LocalWorld(this);

    health?: number;
    maxHealth?: number;
    inventory: string[] = [];

    constructor(opts: GameClientOptions) {
        if (!import.meta.env.PUBLIC_ORIGIN)
            throw new Error("backend origin not specified.");

        this.container = opts.container;
        this.app = new Application();

        this.socket = new SocketClient(this,
            import.meta.env.PUBLIC_ORIGIN,
            { path: "/api/socket", transports: ["websocket"] }
        );

        this.ui = new InterfaceClient(this);

        this.account = opts.account;
    }

    async init() {
        await this.app.init({
            resizeTo: this.container,
            preference: "webgpu"
        });

        this.app.ticker.add(tick => Actions.tick(
            tick.deltaTime / tick.FPS
        ));

        const viewport = new Viewport({
            screenWidth: this.app.renderer.width,
            screenHeight: this.app.renderer.height,
            events: this.app.renderer.events
        })
            .drag()
            .decelerate({ friction: 0.85 })
            .pinch()
            .wheel()
            .clampZoom({ maxScale: 2.5, minScale: 1.5 });

        viewport.eventMode = "static";
        viewport.sortableChildren = true;
        viewport.scale = 2;

        this.viewport = viewport;

        this.app.stage.addChild(viewport);
        this.container.appendChild(this.app.canvas);

        const initialisedClient = this as InitialisedGameClient;

        this.app.renderer.on("resize", (width, height) => {
            viewport.screenWidth = width;
            viewport.screenHeight = height;

            if (!this.world.localPlayer) return;
            
            clampViewportAroundSquare(initialisedClient,
                this.world.localPlayer.x,
                this.world.localPlayer.y
            );
        });

        for (const pieceImage of Object.values(pieceImages)) {
            await Assets.load(pieceImage);
        }

        return initialisedClient;
    }

    isInitialised(): this is InitialisedGameClient {
        return !!this.viewport;
    }

    joinWorld(worldCode: string) {
        this.world.clearLocalChunks();

        this.socket.reconnect();
        this.socket.sendPacket("playerJoin", {
            worldCode: worldCode,
            sessionToken: this.account.session.token
        });

        this.ui.setKickDialog(undefined);
    }

    respawnPlayer() {
        this.world.clearLocalChunks();
        this.socket.sendPacket("playerRespawn", {});
    }
}

export type InitialisedGameClient = (
    Omit<GameClient, "viewport">
    & { viewport: Viewport }
);