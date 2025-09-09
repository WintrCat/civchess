import io, { ManagerOptions, Socket } from "socket.io-client";

import {
    ServerboundPacketType, ServerboundPacketTypeMap,
    ClientboundPacketType, ClientboundPacketTypeMap
} from "shared/socket/PacketType";
import { BasePacket } from "shared/socket/serverbound/BasePacket";

type SocketClientOptions = Partial<ManagerOptions> & BasePacket;

// Serverbound packet without base packet properties
type PacketAdditions<Type extends ServerboundPacketType> = (
    Omit<ServerboundPacketTypeMap[Type], keyof BasePacket>
);

// Packet types that extend the base packet and those that don't
type AdditivePacketTypes = keyof {
    [K in keyof ServerboundPacketTypeMap as (
        keyof PacketAdditions<K> extends never ? never : K
    )]: true
};

type NonAdditivePacketTypes = keyof (
    Omit<ServerboundPacketTypeMap, AdditivePacketTypes>
);

export class SocketClient {
    rawSocket: Socket;

    sessionToken: string;
    worldCode: string;

    constructor(uri: string, options: SocketClientOptions) {
        this.rawSocket = io(uri, options);

        this.sessionToken = options.sessionToken;
        this.worldCode = options.worldCode;
    }

    sendPacket<Type extends AdditivePacketTypes>(
        type: Type,
        packet: PacketAdditions<Type>
    ): void;

    sendPacket<Type extends NonAdditivePacketTypes>(
        type: Type
    ): void;

    sendPacket<Type extends ServerboundPacketType>(
        type: Type,
        packet?: PacketAdditions<Type>
    ) {
        this.rawSocket.emit(type, {
            sessionToken: this.sessionToken,
            worldCode: this.worldCode,
            ...packet
        } satisfies BasePacket);
    }

    on<Type extends ClientboundPacketType>(
        type: Type,
        listener: (packet: ClientboundPacketTypeMap[Type]) => void
    ) {
        this.rawSocket.on(type as string, (
            packet: ClientboundPacketTypeMap[Type]
        ) => listener(packet));
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