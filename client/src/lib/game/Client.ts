import { Application } from "pixi.js";
import { Viewport } from "pixi-viewport";

import {
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/types/packets/PacketType";
import { SocketClient } from "./SocketClient";
import { createMap } from "./Map";

interface PacketHandler<Type extends ClientboundPacketType> {
    type: Type,
    handle: (
        packet: ClientboundPacketTypeMap[Type],
        viewport: Viewport,
        client: GameClient
    ) => void | Promise<void>
};

type AnyPacketHandler = {
    [K in ClientboundPacketType]: PacketHandler<K>
}[ClientboundPacketType];

export class GameClient {
    container: HTMLDivElement;
    app: Application;
    viewport?: Viewport;

    socket: SocketClient;

    config = {
        viewportPadding: 160
    };

    constructor(container: HTMLDivElement) {
        if (!import.meta.env.PUBLIC_ORIGIN)
            throw new Error("backend origin not specified.");

        this.container = container;

        this.app = new Application();

        this.socket = new SocketClient(import.meta.env.PUBLIC_ORIGIN, {
            path: "/api/socket",
            transports: ["websocket"]
        });
    }

    async init() {
        await this.app.init({
            background: "#a1a1a1",
            resizeTo: this.container,
            preference: "webgpu"
        });

        const viewport = new Viewport({
            screenWidth: innerWidth,
            screenHeight: innerHeight,
            worldWidth: 10000,
            worldHeight: 10000,
            events: this.app.renderer.events
        })
            .drag()
            .decelerate({ friction: 0.85 })
            .pinch()
            .wheel()
            .clampZoom({ maxScale: 3, minScale: 1 })
            .clamp({
                left: -this.config.viewportPadding,
                right: 10000 + this.config.viewportPadding,
                top: -this.config.viewportPadding,
                bottom: 10000 + this.config.viewportPadding
            });

        viewport.eventMode = "static";
        viewport.scale = 2;
        this.viewport = viewport;

        this.app.stage.addChild(viewport);
        this.container.appendChild(this.app.canvas);
    }

    attachPacketHandlers(handlers: AnyPacketHandler[]) {
        for (const handler of handlers) {
            this.socket.rawSocket.on(handler.type, async packet => {
                if (!this.viewport) throw new Error(
                    "cannot attach packet handler before initialisation."
                );

                try {
                    await handler.handle(packet, this.viewport, this);
                } catch (err) {
                    console.error(
                        `failed to handle packet(${handler.type}): `
                        + JSON.stringify(packet)
                        + `\n\n${(err as Error).message}`
                    );
                }
            });
        }
    }

    joinWorld(worldCode: string, sessionToken: string) {
        this.socket.sendPacket("playerJoin", { worldCode, sessionToken });
    }
}

export function createPacketHandler<Type extends ClientboundPacketType>(
    handler: PacketHandler<Type>
) {
    return handler;
}