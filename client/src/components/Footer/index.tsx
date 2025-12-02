import { CSSProperties } from "react";
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
    </Container>;
}

export default Footer;