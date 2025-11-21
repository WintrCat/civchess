import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { Button, Modal } from "@mantine/core";

import { PublicProfile } from "shared/types/PublicProfile";
import ProfileAvatar from "@/components/ProfileAvatar";
import { authClient } from "@/lib/auth";
import { GameClient } from "@/lib/game/Client";
import handlers from "@/lib/game/handlers";

import styles from "./index.module.css";
import { KickDialog } from "@/lib/game/InterfaceClient";

function Play() {
    const { worldCode } = useParams();
    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const [ gameClient, setGameClient ] = useState<GameClient>();

    const [ kickDialog, setKickDialog ] = useState<KickDialog>();
    const [ playerlist, setPlayerlist ] = useState<PublicProfile[]>([]);
    const [ health, setHealth ] = useState<number>();

    async function joinWorld() {
        if (!wrapperRef.current) return;
        if (!ticket || !worldCode) return;

        const gameClient = await new GameClient({
            container: wrapperRef.current,
            account: ticket,
            uiHooks: { setPlayerlist, setHealth, setKickDialog }
        }).init();

        setGameClient(gameClient);

        gameClient.socket.onDisconnect(() => {
            if (!gameClient.ui.kickDialog)
                gameClient.ui.setKickDialog({});
        });

        gameClient.socket.attachPacketHandlers(handlers);
        gameClient.joinWorld(worldCode);
    }

    useEffect(() => {
        joinWorld();
    }, [wrapperRef.current, ticket, worldCode]);

    return <>
        <div className={styles.wrapper} ref={wrapperRef} />

        <div className={`${styles.guiPanel} ${styles.serverPanel}`}>
            <span>
                Connected to <b>{worldCode}</b>
            </span>

            {playerlist.map(profile => <span
                key={profile.name}
                className={styles.playerHeadline}
            >
                <ProfileAvatar size={30} avatar={profile.avatar} />

                <span>{profile.name}</span>
            </span>)}
        </div>

        <div className={`${styles.guiPanel} ${styles.playerHud}`}>
            Health: {health}
        </div>

        <Modal
            classNames={{ body: styles.deathModal }}
            opened={health != undefined && health <= 0}
            onClose={() => {}}
            withCloseButton={false}
            title="You died!"
            centered
            styles={{
                title: { textAlign: "center", width: "100%" }
            }}
        >
            <Button onClick={() => gameClient?.respawnPlayer()}>
                Respawn
            </Button>

            <a href="/lobby" style={{ textDecoration: "none" }}>
                <Button color="red" fullWidth>
                    Leave world
                </Button>
            </a>
        </Modal>

        <Modal
            classNames={{ body: styles.kickModal }}
            opened={!!kickDialog}
            onClose={() => {}}
            withCloseButton={false}
            title={kickDialog?.title}
            centered
        >
            {kickDialog?.message}

            <div className={styles.kickModalButtons}>
                <Button onClick={() => {
                    if (worldCode) gameClient?.joinWorld(worldCode);
                }}>
                    Rejoin world
                </Button>

                <a href="/lobby" style={{ textDecoration: "none" }}>
                    <Button color="red">
                        Back to lobby
                    </Button>
                </a>
            </div>
        </Modal>
    </>;
}

export default Play;