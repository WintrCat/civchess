import React, { useEffect, useRef } from "react";
import { useParams } from "react-router";

import { authClient } from "@/lib/auth";
import { GameClient } from "@/lib/game/Client";
import handlers from "@/lib/game/handlers";

import styles from "./index.module.css";

function Play() {
    const { worldCode } = useParams();
    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);

    async function joinWorld() {
        if (!wrapperRef.current) return;
        if (!ticket || !worldCode) return;

        const gameClient = new GameClient(wrapperRef.current);
        await gameClient.init();

        gameClient.attachPacketHandlers(handlers);
        gameClient.joinWorld(worldCode, ticket.session.token);
    }

    useEffect(() => {
        joinWorld();
    }, [wrapperRef.current, ticket, worldCode]);

    return <div className={styles.wrapper} ref={wrapperRef} />;
}

export default Play;