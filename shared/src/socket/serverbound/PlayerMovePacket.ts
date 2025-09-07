import { BasePacket } from "./BasePacket";

export interface PlayerMovePacket extends BasePacket {
    x: number;
    y: number;
}