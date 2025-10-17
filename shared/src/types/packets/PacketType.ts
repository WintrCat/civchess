import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PublicProfile } from "../PublicProfile";
import { PlayerLeavePacket } from "./clientbound/PlayerLeavePacket";
import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";
import { WorldChunkLoadPacket } from "./clientbound/WorldChunkLoadPacket";
import { WorldChunkUpdatePacket } from "./clientbound/WorldChunkUpdatePacket";
import { PieceMovePacket } from "./clientbound/PieceMovePacket";

export interface ServerboundPacketTypeMap {
    playerJoin: PlayerJoinPacket;
    playerMove: PlayerMovePacket;
}

export interface ClientboundPacketTypeMap {
    playerJoin: PublicProfile;
    playerLeave: PlayerLeavePacket;
    playerKick: PlayerKickPacket;
    serverInformation: ServerInformationPacket;
    worldChunkLoad: WorldChunkLoadPacket;
    worldChunkUpdate: WorldChunkUpdatePacket;
    pieceMove: PieceMovePacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;