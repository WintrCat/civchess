import io, { ManagerOptions, Socket } from "socket.io-client";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/types/packets/PacketType";
import { GameClient, InitialisedGameClient } from "./Client";

interface PacketHandler<Type extends ClientboundPacketType> {
    type: Type,
    handle: (
        packet: ClientboundPacketTypeMap[Type],
        client: InitialisedGameClient
    ) => void | Promise<void>
};

type AnyPacketHandler = {
    [K in ClientboundPacketType]: PacketHandler<K>
}[ClientboundPacketType];

export class SocketClient {
    gameClient: GameClient;
    rawSocket: Socket;

    constructor(
        gameClient: GameClient,
        uri: string,
        options: Partial<ManagerOptions>
    ) {
        this.gameClient = gameClient;
        this.rawSocket = io(uri, options);
    }

    sendPacket<Type extends ServerboundPacketType>(
        type: Type,
        packet: ServerboundPacketTypeMap[Type]
    ) {
        this.rawSocket.emit(type, packet);
    }

    on<Type extends ClientboundPacketType>(
        type: Type,
        listener: (packet: ClientboundPacketTypeMap[Type]) => void
    ) {
        this.rawSocket.on(String(type), (
            packet: ClientboundPacketTypeMap[Type]
        ) => listener(packet));
    }

    onAny(
        listener: (eventName: string, ...args: any[]) => void
    ) {
        this.rawSocket.onAny(listener);
    }

    onDisconnect(
        listener: (reason: Socket.DisconnectReason) => void
    ) {
        this.rawSocket.on("disconnect", reason => listener(reason));
    }

    disconnect() {
        this.rawSocket.disconnect();
    }

    attachPacketHandler(handler: AnyPacketHandler) {
        if (!this.gameClient.viewport) throw new Error(
            "cannot handle packets before client is initialised."
        );

        this.rawSocket.on(handler.type, async packet => {
            try {
                await handler.handle(
                    packet, this.gameClient as InitialisedGameClient
                );
            } catch (rawError) {
                const error = rawError as Error;

                const message = error.stack
                    || `${error.name}: ${error.message}`;

                console.error(
                    `failed to handle packet(${handler.type}): `
                    + `${JSON.stringify(packet)}\n\n${message}`
                );
            }
        });
    }

    attachPacketHandlers(handlers: AnyPacketHandler[]) {
        for (const handler of handlers)
            this.attachPacketHandler(handler);
    }
}

export function createPacketHandler<Type extends ClientboundPacketType>(
    handler: PacketHandler<Type>
) {
    return handler;
}