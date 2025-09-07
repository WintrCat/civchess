import { Socket } from "socket.io";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/socket/PacketType";

export function createPacketHandler<Type extends ServerboundPacketType>(
    type: Type,
    handlerFn: (
        packet: ServerboundPacketTypeMap[Type],
        socket: Socket
    ) => void
) {
    return { type, handlerFn };
}

export function attachPacketHandlers(
    socket: Socket,
    handlers: ReturnType<typeof createPacketHandler>[]
) {
    for (const handler of handlers) {
        type PacketType = ServerboundPacketTypeMap[typeof handler.type];

        socket.on(handler.type, (packet: PacketType) => (
            handler.handlerFn(packet, socket)
        ));
    }
}

export function sendPacket<Type extends ClientboundPacketType> (
    socket: Socket,
    type: Type,
    packet: ClientboundPacketTypeMap[Type],
    configureSender?: (socket: Socket) => Pick<Socket, "emit">
) {
    const configuredSocket = configureSender
        ? configureSender(socket)
        : socket;

    configuredSocket.emit(type, packet);
}