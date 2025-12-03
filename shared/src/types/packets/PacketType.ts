// Serverbound
import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMoveAck, PlayerMovePacket } from "./serverbound/PlayerMovePacket";

// Clientbound
import { ServerInformationPacket } from "./clientbound/ServerInformationPacket";

import { WorldChunkLoadPacket } from "./clientbound/WorldChunkLoadPacket";
import { WorldChunkUpdatePacket } from "./clientbound/WorldChunkUpdatePacket";

import { PlayerInformationPacket } from "./clientbound/PlayerInformationPacket";
import { PublicProfile } from "../PublicProfile";
import { PlayerLeavePacket } from "./clientbound/PlayerLeavePacket";
import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { PlayerHealthPacket } from "./clientbound/PlayerHealthPacket";

import { PieceMovePacket } from "./clientbound/PieceMovePacket";

export interface ServerboundPacketTypeMap {
    playerJoin: PlayerJoinPacket;
    playerMove: PlayerMovePacket;
    playerRespawn: {};
}

export interface ClientboundPacketTypeMap {
    serverInformation: ServerInformationPacket;

    worldChunkLoad: WorldChunkLoadPacket;
    worldChunkUpdate: WorldChunkUpdatePacket;

    playerInformation: PlayerInformationPacket;
    playerJoin: PublicProfile;
    playerLeave: PlayerLeavePacket;
    playerKick: PlayerKickPacket;
    playerHealth: PlayerHealthPacket;
    
    pieceMove: PieceMovePacket;
}

export type ServerboundPacketType = keyof ServerboundPacketTypeMap;
export type ClientboundPacketType = keyof ClientboundPacketTypeMap;

interface PacketAcknowledgements {
    playerMove: PlayerMoveAck;
}

export type PacketAcknowledger<T extends ServerboundPacketType> = (
    T extends keyof PacketAcknowledgements
        ? (response: PacketAcknowledgements[T]) => void
        : undefined
);