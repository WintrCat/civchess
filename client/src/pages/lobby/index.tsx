import React, { useState } from "react";
import { useNavigate } from "react-router";
import { IconPlus, IconUser, IconLogout } from "@tabler/icons-react";
import { Divider, TextInput, Button, Menu, LoadingOverlay } from "@mantine/core";

import { WorldMetadata } from "shared/types/World";
import Container from "@/components/Container";
import CreditContainer from "@/components/CreditContainer";
import UpsertWorldModal from "@/components/UpsertWorldModal";
import WorldListing from "@/components/WorldListing";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useServerState } from "@/hooks/useServerState";
import authClient from "@/lib/auth";

import styles from "./index.module.css";

import whiteKing from "@assets/img/pieces/wK.svg";

function Lobby() {
    useProtectedRoute();

    const navigate = useNavigate();

    const {
        data: pinnedWorlds, status: pinnedWorldsStatus
    } = useServerState<WorldMetadata[]>(
        "/api/worlds/get?pinned=1", ["worlds", "pinned"]
    );

    const {
        data: worlds, status: worldsStatus
    } = useServerState<WorldMetadata[]>("/api/worlds/get", "worlds");

    const { data: session } = authClient.useSession();

    const [ createWorldOpen, setCreateWorldOpen ] = useState(false);

    async function signOut() {
        await authClient.signOut();
        navigate("/signin");
    }

    return <div className={styles.wrapper}>
        <span className={styles.typography}>
            CivChess
        </span>

        <Container className={styles.dialog} gradient>
            <div className={styles.topSection}>
                <span>Join a server</span>

                <Menu width={150} withArrow styles={{
                    itemLabel: { fontSize: "1rem" }
                }}>
                    <Menu.Target>
                        <span className={styles.profile}>
                            <LoadingOverlay
                                visible={!session?.user.name}
                                loaderProps={{ size: "sm" }}
                            />

                            {session?.user.name || "Loading..."}

                            <img src={whiteKing} height={40} />
                        </span>

                        
                    </Menu.Target>

                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconUser size={20}/>}>
                            Profile
                        </Menu.Item>

                        <Menu.Item
                            leftSection={<IconLogout size={20}/>}
                            onClick={signOut}
                        >
                            Sign out
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </div>

            <Divider
                label="PINNED WORLDS"
                style={{ width: "100%" }}
            />

            {pinnedWorldsStatus == "success" && (pinnedWorlds.length > 0
                ? pinnedWorlds.map(world => (
                    <WorldListing world={world} key={world.code} />
                ))
                : <i style={{ color: "grey"}}>
                    There aren't any pinned worlds right now.
                </i>
            )}

            <Divider
                label="YOUR WORLDS"
                style={{ width: "100%" }}
            />

            {worldsStatus == "success" && worlds.map(world => (
                <WorldListing
                    world={world}
                    showDates
                    showToolbar
                    key={world.code}
                />
            ))}

            <Button
                size="md"
                color="var(--ui-shade-5)"
                leftSection={<IconPlus size={26} />}
                onClick={() => setCreateWorldOpen(true)}
            >
                Create World
            </Button>

            <Divider
                label="JOIN WORLD"
                style={{ width: "100%" }}
            />

            <div className={styles.joinCodeContainer}>
                <TextInput
                    size="md"
                    placeholder="World ID..."
                    styles={{ wrapper: { width: "250px" } }}
                />

                <Button size="md" color="var(--ui-shade-5)">
                    Join World
                </Button>
            </div>
        </Container>

        <UpsertWorldModal
            open={createWorldOpen}
            onClose={() => setCreateWorldOpen(false)}
        />

        <CreditContainer className={styles.credit} />
    </div>;
}

export default Lobby;