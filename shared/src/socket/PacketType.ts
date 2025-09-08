import { BasePacket } from "./serverbound/BasePacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PlayerJoinRejectionPacket } from "./clientbound/PlayerJoinRejectionPacket";
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";

export interface ServerboundPacketTypeMap {
    playerJoin: BasePacket;
    playerMove: PlayerMovePacket;
}

export interface ClientboundPacketTypeMap {
    playerJoinRejection: PlayerJoinRejectionPacket;
    serverInformation: ServerInformationPacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;