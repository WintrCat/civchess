import React, { useEffect, useRef } from "react";

import { loadApplication } from "@/lib/game/App";

import styles from "./index.module.css";

function Play() {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;
        loadApplication(wrapperRef.current);
    }, []);

    return <div className={styles.wrapper} ref={wrapperRef} />;
}

export default Play;