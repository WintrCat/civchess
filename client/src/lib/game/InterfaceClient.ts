import { Dispatch, SetStateAction } from "react";

import { PublicProfile } from "shared/types/PublicProfile";
import { GameClient } from "./Client";

export interface UIHooks {
    setPlayerlist?: Dispatch<SetStateAction<PublicProfile[]>>;
    setHealth?: Dispatch<SetStateAction<number>>;
}

export class InterfaceClient {
    gameClient: GameClient;
    hooks: UIHooks;

    constructor(client: GameClient, hooks?: UIHooks) {
        this.gameClient = client;
        this.hooks = hooks || {};
    }

    updatePlayerlist() {
        this.hooks.setPlayerlist?.(
            Object.values(this.gameClient.world.playerlist)
        );
    }

    updateHealthbar() {
        if (this.gameClient.health == undefined) return;
        
        this.hooks.setHealth?.(this.gameClient.health);
    }
}