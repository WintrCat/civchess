import React from "react";

import { ContainerProps } from "./ContainerProps";
import styles from "./Container.module.css";

function Container({
    className,
    style,
    gradient,
    noShadow,
    onClick,
    children
}: ContainerProps) {
    return <div
        className={[
            styles.wrapper,
            className,
            !noShadow && styles.shadow,
            gradient && styles.gradient
        ].join(" ")}
        style={style}
        onClick={onClick}
    >
        {children}
    </div>;
}

export default Container;