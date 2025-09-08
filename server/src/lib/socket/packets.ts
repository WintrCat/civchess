import { Socket } from "socket.io";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/socket/PacketType";
import { BasePacket } from "shared/socket/serverbound/BasePacket";

// Clientbound packets types that do or do not require any properties
type AdditivePacketTypes = keyof {
    [K in keyof ClientboundPacketTypeMap as (
        keyof ClientboundPacketTypeMap[K] extends never ? never : K
    )]: true
};

type NonAdditivePacketTypes = keyof (
    Omit<ClientboundPacketTypeMap, AdditivePacketTypes>
);

// Packet Handler middleware function
export type PacketMiddleware = (
    type: ServerboundPacketType,
    packet: BasePacket
) => void | Promise<void>;

export function createPacketHandler<Type extends ServerboundPacketType>(
    type: Type,
    handlerFn: (
        packet: ServerboundPacketTypeMap[Type],
        socket: Socket
    ) => void | Promise<void>
) {
    return { type, handlerFn };
}

export function attachPacketHandlers(
    socket: Socket,
    handlers: ReturnType<typeof createPacketHandler>[],
    middleware?: PacketMiddleware
) {
    for (const handler of handlers) {
        type Packet = ServerboundPacketTypeMap[typeof handler.type];

        socket.on(handler.type, async (packet: Packet) => {
            await middleware?.(handler.type, packet);
            await handler.handlerFn(packet, socket);
        });
    }
}

export function sendPacket<Type extends AdditivePacketTypes> (
    socket: Socket,
    type: Type,
    packet: ClientboundPacketTypeMap[Type],
    configureSender?: (socket: Socket) => Pick<Socket, "emit">
): void;

export function sendPacket<Type extends NonAdditivePacketTypes> (
    socket: Socket,
    type: Type,
    packet?: ClientboundPacketTypeMap[Type],
    configureSender?: (socket: Socket) => Pick<Socket, "emit">
): void;

export function sendPacket<Type extends ClientboundPacketType> (
    socket: Socket,
    type: Type,
    packet?: ClientboundPacketTypeMap[Type],
    configureSender?: (socket: Socket) => Pick<Socket, "emit">
) {
    const configuredSocket = configureSender
        ? configureSender(socket)
        : socket;

    configuredSocket.emit(type, packet || {});
}