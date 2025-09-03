import React, { CSSProperties } from "react";
import { Anchor } from "@mantine/core";

import Container from "../Container";

import styles from "./index.module.css";

interface FooterProps {
    className?: string;
    style?: CSSProperties;
}

function Footer({ className, style }: FooterProps) {
    return <Container
        className={`${styles.wrapper} ${className}`}
        style={style}
    >
        <span className={styles.links}>
            <Anchor href="/terms" className="light-up">
                <u>Terms of Service</u>
            </Anchor>

            <b>|</b>

            <Anchor href="/privacy" className="light-up">
                <u>Privacy Policy</u>
            </Anchor>

            <b>|</b>

            <Anchor href="/credits" className="light-up">
                <u>Credits</u>
            </Anchor>
        </span>

        <span className={styles.promotion}>
            ☕ Built by{" "}

            <Anchor
                className={`${styles.promotion} light-up`}
                href="https://youtube.com/@wintrcat"
            >
                <u>the wintrcat community</u>
            </Anchor>
        </span>
    </Container>;
}

export default Footer;