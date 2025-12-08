import { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Group,
    Kbd,
    Progress,
    Stack,
    Collapse
} from "@mantine/core";
import { useDisclosure, useHotkeys } from "@mantine/hooks";
import { IconChevronDown, IconViewfinder } from "@tabler/icons-react";

import { PlayerKickPacket } from "shared/types/packets/clientbound/PlayerKickPacket";
import { PublicProfile } from "shared/types/PublicProfile";
import ProfileAvatar from "@/components/ProfileAvatar";
import { InitialisedGameClient } from "@/lib/game/Client";
import {
    isVisibleInViewport,
    moveViewportToSquare
} from "@/lib/game/utils/viewport";

import styles from "./PlayerHud.module.css"

interface PlayerHudProps {
    client: InitialisedGameClient;
    worldCode: string;
}

function PlayerHud({ client, worldCode }: PlayerHudProps) {
    const [ serverPanelExpanded, serverPanel ] = useDisclosure();
    const [ playerlist, setPlayerlist ] = useState<PublicProfile[]>([]);

    const [ health, setHealth ] = useState<number>();

    const [ playerVisible, setPlayerVisible ] = useState(true);
    const [ kickDialog, setKickDialog ] = useState<PlayerKickPacket>();

    useEffect(() => {
        client.ui.hooks = {
            setKickDialog,
            setPlayerlist,
            setHealth,
            setPlayerVisible
        };

        client.viewport.on("moved", () => {
            if (!client.world.localPlayer) return;
            setPlayerVisible(isVisibleInViewport(
                client.viewport, client.world.localPlayer.sprite
            ));
        });
    }, [client]);

    function recenterCamera() {
        if (!client.viewport) return;
        if (!client.world.localPlayer) return;

        moveViewportToSquare(client.viewport,
            client.world.localPlayer.x,
            client.world.localPlayer.y
        );

        setPlayerVisible(true);
    }

    useHotkeys([["R", recenterCamera]]);

    return <>
        <div className={`${styles.panel} ${styles.serverPanel}`} style={{
            paddingBottom: serverPanelExpanded ? "5px" : "0"
        }}>
            <Group p="3px 5px" gap="5px">
                <span>
                    Connected to <b>{worldCode}</b>
                </span>

                <IconChevronDown onClick={() => serverPanel.toggle()} style={{
                    cursor: "pointer", transform: serverPanelExpanded
                        ? "rotate(180deg)" : undefined
                }}/>
            </Group>

            <Collapse in={serverPanelExpanded}>
                <Stack className={styles.playerlist} gap="5px">
                    {playerlist.map(profile => <Group
                        key={profile.name}
                        gap="10px"
                    >
                        <ProfileAvatar size={30} avatar={profile.avatar} />

                        <span>{profile.name}</span>
                    </Group>)}
                </Stack>
            </Collapse>
        </div>

        <div className={`${styles.panel} ${styles.playerStats}`}>
            Health

            <Progress
                value={(client.health || 0) / (client.maxHealth || 1) * 100}
                w="100%" h="30px" color="#2dff5a"
            />
        </div>

        {!playerVisible && <Group className={styles.recenterButton}>
            <Button
                size="md"
                color="dark"
                leftSection={<IconViewfinder/>}
                rightSection={<Kbd>R</Kbd>}
                onClick={recenterCamera}
            >
                Recenter
            </Button>
        </Group>}

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
            {kickDialog?.reason}

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