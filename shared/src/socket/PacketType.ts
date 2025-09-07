import { BasePacket } from "./serverbound/BasePacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";

export interface ServerboundPacketTypeMap {
    playerJoin: BasePacket;
    playerMove: PlayerMovePacket;
}

export interface ClientboundPacketTypeMap {
    serverInformation: ServerInformationPacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;