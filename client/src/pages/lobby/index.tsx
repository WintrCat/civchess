import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { Divider, TextInput, Button } from "@mantine/core";

import { WorldMetadata } from "shared/types/game/World";
import Typography from "@/components/Typography";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
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
        <Typography/>

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
                    <WorldListing worldMetadata={world} key={world.code} />
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
                    worldMetadata={world}
                    showDates
                    manageable
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
                    placeholder="World Code..."
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

        <Footer className={styles.credit} />
    </div>;
}

export default Lobby;