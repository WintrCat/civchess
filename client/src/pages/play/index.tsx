import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { PublicProfile } from "shared/types/PublicProfile";
import { authClient } from "@/lib/auth";
import { GameClient } from "@/lib/game/Client";
import handlers from "@/lib/game/handlers";

import styles from "./index.module.css";
import ProfileAvatar from "@/components/ProfileAvatar";

function Play() {
    const { worldCode } = useParams();
    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);

    const [ playerlist, setPlayerlist ] = useState<PublicProfile[]>([]);

    async function joinWorld() {
        if (!wrapperRef.current) return;
        if (!ticket || !worldCode) return;

        const gameClient = await new GameClient(wrapperRef.current, {
            setPlayerlist
        }).init();

        gameClient.socket.attachPacketHandlers(handlers);
        gameClient.joinWorld(worldCode, ticket.session.token);
    }

    useEffect(() => {
        joinWorld();
    }, [wrapperRef.current, ticket, worldCode]);

    return <>
        <div className={styles.wrapper} ref={wrapperRef} />

        <div className={styles.serverPanel}>
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
    </>;
}

export default Play;