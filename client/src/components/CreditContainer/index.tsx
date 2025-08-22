import React, { CSSProperties } from "react";
import { Anchor } from "@mantine/core";

import Container from "../Container";

import styles from "./index.module.css";

interface CreditContainerProps {
    className?: string;
    style?: CSSProperties;
}

function CreditContainer({ className, style }: CreditContainerProps) {
    return <Container
        className={`${styles.wrapper} ${className}`}
        style={style}
    >
        ☕ Built by{" "}

        <Anchor href="https://youtube.com/@wintrcat" className="light-up">
            <u>the wintrcat community</u>
        </Anchor>
    </Container>;
}

export default CreditContainer;