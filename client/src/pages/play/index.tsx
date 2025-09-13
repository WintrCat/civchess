import React, { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router";

import { authClient } from "@/lib/auth";
import { SocketClient } from "@/lib/socketClient";
import { loadApplication } from "@/lib/game/App";

import styles from "./index.module.css";

function Play() {
    const { worldCode } = useParams();

    const { data: ticket } = authClient.useSession();

    const wrapperRef = useRef<HTMLDivElement>(null);

    const socketClient = useMemo(() => (
        new SocketClient(import.meta.env.PUBLIC_ORIGIN, {
            path: "/api/socket",
            transports: ["websocket"]
        })
    ), []);

    useEffect(() => {
        if (!wrapperRef.current) return;
        loadApplication(wrapperRef.current);
    }, []);

    useEffect(() => {
        if (!ticket || !worldCode) return;

        socketClient.sendPacket("playerJoin", {
            sessionToken: ticket.session.token,
            worldCode: worldCode
        });

        socketClient.onAny((eventName, packet) => {
            console.log(packet);
        });

        socketClient.onDisconnect(() => {
            console.log("you just got disconnected.");
        });

        return () => socketClient.disconnect();
    }, [ticket, worldCode])

    return <div className={styles.wrapper} ref={wrapperRef} />;
}

export default Play;