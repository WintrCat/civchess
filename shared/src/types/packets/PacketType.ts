import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PublicProfile } from "../PublicProfile";
import { PlayerLeavePacket } from "./clientbound/PlayerLeavePacket";
import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { PlayerSpawnPacket } from "./clientbound/PlayerSpawnPacket";
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";
import { WorldChunkLoadPacket } from "./clientbound/WorldChunkLoadPacket";
import { WorldChunkUpdatePacket } from "./clientbound/WorldChunkUpdatePacket";

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
    worldChunkLoad: WorldChunkLoadPacket;
    worldChunkUpdate: WorldChunkUpdatePacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;