import { Button, ButtonProps } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";

function ReturnButton(props: ButtonProps) {
    return <a href="/lobby">
        <Button
            leftSection={<IconHome/>}
            color="blue"
            variant="light"
            {...props}
        >
            {props.children || "Return to Lobby"}
        </Button>
    </a>;
}

export default ReturnButton;