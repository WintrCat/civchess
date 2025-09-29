import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PublicProfile } from "../PublicProfile";
import { PlayerLeavePacket } from "./clientbound/PlayerLeavePacket";
import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { PlayerSpawnPacket } from "./clientbound/PlayerSpawnPacket";
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";
import { WorldChunkPacket } from "./clientbound/WorldChunkPacket";

export interface ServerboundPacketTypeMap {
    playerJoin: PlayerJoinPacket;
    playerMove: PlayerMovePacket;
}

export interface ClientboundPacketTypeMap {
    playerJoin: PublicProfile;
    playerLeave: PlayerLeavePacket;
    playerKick: PlayerKickPacket;
    playerSpawn: PlayerSpawnPacket;
    serverInformation: ServerInformationPacket;
    worldChunk: WorldChunkPacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;