import { Dispatch, SetStateAction } from "react";

import { PublicProfile } from "shared/types/PublicProfile";
import { GameClient } from "./Client";

export interface UIHooks {
    setPlayerlist?: Dispatch<SetStateAction<PublicProfile[]>>;
}

export class InterfaceClient {
    private client: GameClient;
    private hooks: UIHooks;

    constructor(client: GameClient, hooks?: UIHooks) {
        this.client = client;
        this.hooks = hooks || {};
    }

    updatePlayerlist() {
        this.hooks.setPlayerlist?.(
            Object.values(this.client.world.playerlist)
        );
    }
}