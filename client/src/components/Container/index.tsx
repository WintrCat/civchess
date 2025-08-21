import React, { ReactNode, CSSProperties } from "react";

import styles from "./Container.module.css";

interface ContainerProps {
    className?: string;
    style?: CSSProperties;
    gradient?: boolean;
    noShadow?: boolean;
    onClick?: () => void;
    children?: ReactNode;
}

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