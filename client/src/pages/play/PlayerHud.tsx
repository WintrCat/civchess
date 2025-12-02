import { useState, useEffect } from "react";
import { Modal, Button, Group } from "@mantine/core";

import { PublicProfile } from "shared/types/PublicProfile";
import ProfileAvatar from "@/components/ProfileAvatar";
import { GameClient } from "@/lib/game/Client";
import { KickDialog } from "@/lib/game/InterfaceClient";

import styles from "./index.module.css";

interface PlayerHudProps {
    client: GameClient;
    worldCode: string;
}

function PlayerHud({ client, worldCode }: PlayerHudProps) {
    const [ kickDialog, setKickDialog ] = useState<KickDialog>();
    const [ playerlist, setPlayerlist ] = useState<PublicProfile[]>([]);
    const [ health, setHealth ] = useState<number>();

    useEffect(() => {
        client.ui.hooks = { setKickDialog, setPlayerlist, setHealth };
    }, [client]);

    return <>
        <div className={`${styles.panel} ${styles.serverPanel}`}>
            <span>
                Connected to <b>{worldCode}</b>
            </span>

            {playerlist.map(profile => <Group
                key={profile.name}
                gap="10px"
                w="100%"
            >
                <ProfileAvatar size={30} avatar={profile.avatar} />

                <span>{profile.name}</span>
            </Group>)}
        </div>

        <div className={`${styles.panel} ${styles.playerStats}`}>
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
            <Button onClick={() => client?.respawnPlayer()}>
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

            <Group gap="10px">
                <Button onClick={() => {
                    if (worldCode) client?.joinWorld(worldCode);
                }}>
                    Rejoin world
                </Button>

                <a href="/lobby" style={{ textDecoration: "none" }}>
                    <Button color="red">
                        Back to lobby
                    </Button>
                </a>
            </Group>
        </Modal>
    </>;
}

export default PlayerHud;