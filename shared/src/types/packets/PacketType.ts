import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";
import { WorldChunkPacket } from "./clientbound/WorldChunkPacket";

export interface ServerboundPacketTypeMap {
    playerJoin: PlayerJoinPacket;
    playerMove: PlayerMovePacket;
}

export interface ClientboundPacketTypeMap {
    playerKick: PlayerKickPacket;
    serverInformation: ServerInformationPacket;
    worldChunk: WorldChunkPacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;