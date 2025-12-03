import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";

import { authClient } from "@/lib/auth";
import { GameClient } from "@/lib/game/Client";
import handlers from "@/lib/game/handlers";
import PlayerHud from "./PlayerHud";

import styles from "./index.module.css";

function Play() {
    const { worldCode } = useParams();
    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);
    
    const [ gameClient, setGameClient ] = useState<GameClient>();

    async function joinWorld() {
        if (!wrapperRef.current) return;
        if (!ticket || !worldCode) return;

        const gameClient = await new GameClient({
            container: wrapperRef.current,
            account: ticket
        }).init();

        setGameClient(gameClient);

        gameClient.socket.onDisconnect(() => {
            if (!gameClient.ui.kickDialog)
                gameClient.ui.setKickDialog({});
        });

        gameClient.socket.attachPacketHandlers(handlers);
        gameClient.joinWorld(worldCode);
    }

    useEffect(() => {
        joinWorld();
    }, [wrapperRef.current, ticket, worldCode]);

    return <>
        <div className={styles.application} ref={wrapperRef} />

        {gameClient?.isInitialised() && worldCode
            && <PlayerHud client={gameClient} worldCode={worldCode} />
        }
    </>;
}

export default Play;