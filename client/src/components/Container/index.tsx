import React from "react";

import { ContainerProps } from "./ContainerProps";
import styles from "./Container.module.css";

function Container({
    className,
    style,
    gradient,
    children
}: ContainerProps) {
    return <div
        className={[
            styles.wrapper,
            className,
            gradient && styles.gradient
        ].join(" ")}
        style={style}
    >
        {children}
    </div>;
}

export default Container;