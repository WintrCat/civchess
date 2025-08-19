import React from "react";
import { Anchor } from "@mantine/core";

import Container from "../Container";

import { CreditContainerProps } from "./CreditContainerProps";
import styles from "./CreditContainer.module.css";

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