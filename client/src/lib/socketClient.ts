import io, { ManagerOptions, Socket } from "socket.io-client";

import {
    ServerboundPacketType,
    ServerboundPacketTypeMap,
    ClientboundPacketType,
    ClientboundPacketTypeMap
} from "shared/types/packets/PacketType";

export class SocketClient {
    rawSocket: Socket;

    constructor(uri: string, options: Partial<ManagerOptions>) {
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
}