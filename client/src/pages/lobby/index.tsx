import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Divider, TextInput, Button } from "@mantine/core";

import { WorldMetadata } from "shared/types/World";
import Container from "@/components/Container";
import CreditContainer from "@/components/CreditContainer";
import UpsertWorldModal from "@/components/UpsertWorldModal";
import WorldListing from "@/components/WorldListing";
import ProfileMenu from "./ProfileMenu";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { useServerState } from "@/hooks/useServerState";

import styles from "./index.module.css";

function Lobby() {
    useProtectedRoute();

    const {
        data: pinnedWorlds, status: pinnedWorldsStatus
    } = useServerState<WorldMetadata[]>(
        "/api/worlds/get?pinned=1", ["worlds", "pinned"]
    );

    const {
        data: worlds, status: worldsStatus
    } = useServerState<WorldMetadata[]>("/api/worlds/get", "worlds");

    const [ createWorldOpen, setCreateWorldOpen ] = useState(false);

    return <div className={styles.wrapper}>
        <span className={styles.typography}>
            CivChess
        </span>

        <Container className={styles.dialog} gradient>
            <div className={styles.topSection}>
                <span className={styles.joinServer}>
                    Join a server
                </span>

                <ProfileMenu className={styles.profileMenu} />
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