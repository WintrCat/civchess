import { ReactNode } from "react";
import { Group, Stack, Button, DefaultMantineColor } from "@mantine/core";

import styles from "./index.module.css";

interface CreditProfileProps {
    image?: string;
    title: string;
    connections?: {
        name: string;
        icon?: ReactNode;
        colour?: DefaultMantineColor;
        url: string;
    }[];
}

function CreditProfile({
    image,
    title,
    connections = []
}: CreditProfileProps) {
    return <Group justify="center">
        <img className={styles.profileImage} src={image}/>
        
        <Stack gap="10px">
            <span style={{ textAlign: "center"}}>{title}</span>

            <Group gap="10px" justify="center">
                {connections.map(conn => <a href={conn.url}>
                    <Button
                        key={conn.name}
                        color={conn.colour || "gray"}
                        variant="light"
                        leftSection={conn.icon}
                    >
                        {conn.name}
                    </Button>
                </a>)}
            </Group>
        </Stack>
    </Group>;
}

export default CreditProfile;