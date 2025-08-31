import { World } from "shared/types/game/World";

export interface OnlineWorld extends World {
    connectedPlayers: string[];
}