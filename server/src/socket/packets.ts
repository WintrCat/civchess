import { Socket } from "socket.io";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/types/packets/PacketType";
import { kickPlayer } from "./lib/players";
import { PacketMiddleware } from "./middleware";

type EmittableSocket = Pick<Socket, "emit">;

// Packet handlers
interface PacketHandler<Type extends ServerboundPacketType> {
    type: Type,
    handle: (
        packet: ServerboundPacketTypeMap[Type],
        socket: Socket
    ) => void | Promise<void>
};

type AnyPacketHandler = {
    [K in ServerboundPacketType]: PacketHandler<K>
}[ServerboundPacketType];

export function createPacketHandler<Type extends ServerboundPacketType>(
    handler: PacketHandler<Type>
) {
    return handler;
}

export function attachPacketHandlers(
    socket: Socket,
    handlers: AnyPacketHandler[],
    middleware?: PacketMiddleware
) {
    for (const handler of handlers) {
        socket.on(handler.type, async packet => {
            try {
                await middleware?.(socket, handler.type, packet);
                await handler.handle(packet, socket);
            } catch (err) {
                console.log("Failed to handle packet:");
                console.log(err);

                kickPlayer(socket, err instanceof Error
                    ? err.message : "Illegal packet."
                );
            }
        });
    }
}

export function sendPacket<
    Type extends ClientboundPacketType,
    Receiver extends EmittableSocket
>(
    socket: Receiver,
    type: Type,
    packet: ClientboundPacketTypeMap[Type],
    configureSender = (socket: Receiver): EmittableSocket => socket
) {
    configureSender(socket).emit(type, packet);
}