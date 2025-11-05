import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { PublicProfile } from "shared/types/PublicProfile";
import { authClient } from "@/lib/auth";
import { GameClient } from "@/lib/game/Client";
import handlers from "@/lib/game/handlers";
import ProfileAvatar from "@/components/ProfileAvatar";

import styles from "./index.module.css";

function Play() {
    const { worldCode } = useParams();
    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);

    const [ playerlist, setPlayerlist ] = useState<PublicProfile[]>([]);

    const [ health, setHealth ] = useState(0);

    async function joinWorld() {
        if (!wrapperRef.current) return;
        if (!ticket || !worldCode) return;

        const gameClient = await new GameClient(wrapperRef.current, {
            setPlayerlist,
            setHealth
        }).init();

        gameClient.socket.attachPacketHandlers(handlers);
        gameClient.joinWorld(worldCode, ticket.session.token);
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
    </>;
}

export default Play;