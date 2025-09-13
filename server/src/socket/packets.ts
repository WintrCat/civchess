import { Socket } from "socket.io";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/types/packets/PacketType";
import { kickPlayer } from "./lib/manage-players";

export type EmittableSocket = Pick<Socket, "emit">;

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
    handlers: AnyPacketHandler[]
) {
    for (const handler of handlers) {
        socket.on(handler.type, async packet => {
            try {
                await handler.handle(packet, socket)
            } catch {
                kickPlayer(socket, "Illegal packet.");
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
    configureSender?: (socket: Receiver) => EmittableSocket
) {
    const configuredSocket = configureSender
        ? configureSender(socket)
        : socket;

    configuredSocket.emit(type, packet);
}