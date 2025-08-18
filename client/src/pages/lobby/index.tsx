import React, { useState } from "react";
import { MenuDropdown, Divider, TextInput, Button } from "@mantine/core";

import Container from "@/components/Container";

import styles from "./index.module.css";

import createIcon from "@assets/img/create.svg";
import CreateWorldModal from "./CreateWorldModal/CreateWorldModal";

function Lobby() {
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

            <span>aaa</span>

            <Button
                size="md"
                color="var(--ui-shade-5)"
                leftSection={<img src={createIcon} height={26} />}
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
    </div>;
}

export default Lobby;