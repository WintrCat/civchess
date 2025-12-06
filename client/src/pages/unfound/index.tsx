import { useMemo } from "react";
import { Group } from "@mantine/core";

import ReturnButton from "@/components/ReturnButton";

import styles from "./index.module.css";

function Unfound() {
    const campfireAudio = useMemo(() => (
        new Audio("/audio/campfire.mp3")
    ), []);

    return <div className={styles.wrapper}>
        <span className={styles.message}>
            404
        </span>

        <span>
            You seem lost, King. Don't worry, you may rest
            here tonight.
        </span>

        <Group gap="20px">
            <img src="/img/pieces/wK.svg" height="150px"/>
            <img
                src="/img/campfire.gif"
                height="130px"
                onClick={() => {
                    if (campfireAudio.paused) return campfireAudio.play();
                    campfireAudio.pause();
                }}
                style={{ cursor: "pointer" }}
            />
        </Group>

        <ReturnButton color="orange">
            Take me Home
        </ReturnButton>
    </div>;
}

export default Unfound;