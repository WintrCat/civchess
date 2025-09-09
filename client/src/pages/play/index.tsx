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

    const socketClient = useMemo(() => {
        if (!ticket?.session || !worldCode) return null;

        return new SocketClient(import.meta.env.PUBLIC_ORIGIN, {
            sessionToken: ticket.session.token,
            worldCode: worldCode,
            path: "/api/socket",
            transports: ["websocket"]
        });
    }, [ticket, worldCode]);

    useEffect(() => {
        if (!wrapperRef.current) return;
        loadApplication(wrapperRef.current);
    }, []);

    useEffect(() => {
        if (!socketClient) return;

        socketClient.sendPacket("playerJoin");

        socketClient.on("serverInformation", packet => {
            console.log(packet)
        });

        socketClient.on("playerKick", packet => {
            console.log(`Kicked - ${packet.title} - ${packet.reason}`);
        });

        socketClient.onDisconnect(() => {
            console.log("you just got disconnected.");
        });

        return () => socketClient.disconnect();
    }, [socketClient])

    return <div className={styles.wrapper} ref={wrapperRef} />;
}

export default Play;