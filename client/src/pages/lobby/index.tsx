import React, { useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Divider, TextInput, Button } from "@mantine/core";

import { WorldMetadata } from "shared/types/World";
import Container from "@/components/Container";
import CreditContainer from "@/components/CreditContainer";
import CreateWorldModal from "./CreateWorldModal";
import WorldListing from "@/components/WorldListing";

import styles from "./index.module.css";

function Lobby() {
    const { data: worlds, status: worldsStatus } = useQuery({
        queryKey: ["worlds"],
        queryFn: async () => {
            const response = await fetch("/api/worlds");
            if (!response.ok) throw new Error();

            return await response.json() as WorldMetadata[];
        }
    });

    const [ createWorldOpen, setCreateWorldOpen ] = useState(false);

    return <div className={styles.wrapper}>
        <span className={styles.typography}>
            CivChess
        </span>

        <Container className={styles.dialog} gradient>
            <div className={styles.topSection}>
                <span>Join a server</span>

                <span>wintrcat_gaming45</span>
            </div>

            <Divider style={{ width: "100%" }} />

            <span>SERVER SERVER SERVER</span>

            <Divider
                label="YOUR WORLDS"
                labelPosition="center"
                style={{ width: "100%" }}
            />

            {worldsStatus == "success" && worlds.map(world => (
                <WorldListing world={world} showDates showToolbar key={world.code} />
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
                labelPosition="center"
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

        <CreateWorldModal
            open={createWorldOpen}
            onClose={() => setCreateWorldOpen(false)}
        />

        <CreditContainer className={styles.credit} />
    </div>;
}

export default Lobby;