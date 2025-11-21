import { Dispatch, SetStateAction } from "react";

import { PublicProfile } from "shared/types/PublicProfile";
import { GameClient } from "./Client";

export interface KickDialog {
    title: string;
    message: string;
}

export interface UIHooks {
    setPlayerlist?: Dispatch<SetStateAction<PublicProfile[]>>;
    setHealth?: Dispatch<SetStateAction<number | undefined>>;
    setKickDialog?: Dispatch<SetStateAction<KickDialog | undefined>>;
}

export class InterfaceClient {
    gameClient: GameClient;
    hooks: UIHooks;

    kickDialog?: KickDialog;

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

    setKickDialog(dialog: Partial<KickDialog> | undefined) {
        this.kickDialog = dialog && {
            title: dialog?.title
                || "Kicked from the world",
            message: dialog?.message
                || "You lost connection to the world."
        };

        this.hooks.setKickDialog?.(this.kickDialog);
    }
}