import { World } from "shared/types/game/World";
import { PublicProfile } from "shared/types/PublicProfile";

export interface OnlineWorld extends World {
    connectedPlayers: PublicProfile[];
}