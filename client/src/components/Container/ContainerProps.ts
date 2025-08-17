import { CSSProperties, ReactNode } from "react";

export interface ContainerProps {
    className?: string;
    style?: CSSProperties;
    gradient?: boolean;
    children?: ReactNode;
}