import { Dispatch } from "react";

import { PlayerKickPacket } from "shared/types/packets/clientbound/PlayerKickPacket";
import { PublicProfile } from "shared/types/PublicProfile";
import { GameClient } from "./Client";

export interface UIHooks {
    setPlayerlist?: Dispatch<PublicProfile[]>;
    setHealth?: Dispatch<number | undefined>;
    setKickDialog?: Dispatch<PlayerKickPacket | undefined>;
    setPlayerVisible?: Dispatch<boolean>;
}

export class InterfaceClient {
    gameClient: GameClient;
    hooks: UIHooks;

    kickDialog?: PlayerKickPacket;

    constructor(client: GameClient, hooks?: UIHooks) {
        this.gameClient = client;
        this.hooks = hooks || {};

        client.socket.onDisconnect(() => {
            if (!client.ui.kickDialog) client.ui.setKickDialog({});
        });
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

    setKickDialog(dialog: Partial<PlayerKickPacket> | undefined) {
        this.kickDialog = dialog && {
            title: dialog?.title
                || "Kicked from the world",
            reason: dialog?.reason
                || "You lost connection to the world."
        };

        this.hooks.setKickDialog?.(this.kickDialog);
    }
}