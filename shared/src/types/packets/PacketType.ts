import { PlayerJoinPacket } from "./serverbound/PlayerJoinPacket";
import { PlayerMoveAck, PlayerMovePacket } from "./serverbound/PlayerMovePacket";

import { PublicProfile } from "../PublicProfile";
import { PlayerLeavePacket } from "./clientbound/PlayerLeavePacket";
import { PlayerKickPacket } from "./clientbound/PlayerKickPacket";
import { PlayerUpdatePacket } from "./clientbound/PlayerUpdatePacket";
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
    playerUpdate: PlayerUpdatePacket;
    serverInformation: ServerInformationPacket;
    worldChunkLoad: WorldChunkLoadPacket;
    worldChunkUpdate: WorldChunkUpdatePacket;
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