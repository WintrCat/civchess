import { useMemo, useState } from "react";
import {
    Divider,
    TextInput,
    Button,
    Group,
    Stack,
    Alert,
    Loader,
    LoadingOverlay
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";
import { io } from "socket.io-client";

import { WorldMetadata } from "shared/types/world/World";
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

    const statusSocket = useMemo(() => io(
        new URL("/world-status", import.meta.env.PUBLIC_ORIGIN).href,
        { path: "/api/socket", transports: ["websocket"] }
    ), []);

    const [ worldError, setWorldError ] = useState<string>();

    const {
        data: pinnedWorlds,
        status: pinnedWorldsStatus
    } = useServerState<WorldMetadata[]>(
        "/api/worlds/get?pinned=1", ["worlds", "pinned"]
    );

    const {
        data: personalWorlds,
        status: personalWorldsStatus
    } = useServerState<WorldMetadata[]>(
        "/api/worlds/get", "worlds"
    );

    const [ createWorldOpen, createWorldModal ] = useDisclosure();

    return <Stack className={styles.wrapper}>
        <Typography/>

        <Container className={styles.dialog} gradient>
            <Group className={styles.topSection}>
                <span className={styles.joinServer}>
                    Join a server
                </span>

                <ProfileMenu className={styles.profileMenu} />
            </Group>

            <Divider label="PINNED WORLDS" w="100%"/>

            {worldError && <Alert color="red" w="100%">
                {worldError}
            </Alert>}

            {pinnedWorldsStatus == "pending" && <Loader/>}

            {pinnedWorldsStatus == "success" && pinnedWorlds.length > 0
                ? pinnedWorlds.map(world => <WorldListing
                    initialWorld={world}
                    setError={setWorldError}
                    statusClient={statusSocket}
                    key={world.code}
                />)
                : <i style={{ color: "grey"}}>
                    There aren't any pinned worlds right now.
                </i>
            }

            {pinnedWorldsStatus == "error" &&
                <Alert color="red" w="100%">
                    Failed to load pinned worlds.
                </Alert>
            }

            <Divider label="YOUR WORLDS" w="100%"/>

            {personalWorldsStatus == "pending" && <Loader/>}

            {personalWorldsStatus == "success" && personalWorlds.length > 0
                ? personalWorlds.map(world => <WorldListing
                    initialWorld={world}
                    showDates
                    manageable
                    setError={setWorldError}
                    statusClient={statusSocket}
                    key={world.code}
                />)
                : <i style={{ color: "grey" }}>
                    You don't have any worlds.
                </i>
            }

            {personalWorldsStatus == "error" &&
                <Alert color="red" w="100%">
                    Failed to load your worlds.
                </Alert>
            }

            <Button
                size="md"
                color="var(--ui-shade-5)"
                leftSection={<IconPlus size={26} />}
                onClick={() => createWorldModal.open()}
            >
                Create World
            </Button>

            <Divider label="JOIN WORLD" w="100%"/>

            <Group w="100%" gap="10px" justify="center">
                <TextInput size="md" placeholder="World Code..." w="250px"/>

                <Button size="md" color="var(--ui-shade-5)">
                    Join World
                </Button>
            </Group>
        </Container>

        <UpsertWorldModal
            open={createWorldOpen}
            onClose={() => createWorldModal.close()}
        />

        <Footer className={styles.credit} />
    </Stack>;
}

export default Lobby;