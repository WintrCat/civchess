import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, ButtonProps, Group, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconTrash, IconEdit, IconLogin2 } from "@tabler/icons-react";
import { Socket } from "socket.io-client";

import { WorldMetadata } from "shared/types/world/World";
import Container from "../Container";
import ConfirmModal from "../ConfirmModal";
import UpsertWorldModal from "@/components/UpsertWorldModal";
import { formatDate } from "@/lib/utils";

import styles from "./index.module.css";

interface WorldListingProps {
    initialWorld: WorldMetadata;
    showDates?: boolean;
    manageable?: boolean;
    setError?: Dispatch<SetStateAction<string | undefined>>;
    statusClient?: Socket;
}

type WorldActions = Record<"delete" | "host" | "shutdown", string>;

const toolbarButtonOptions: ButtonProps = {
    color: "var(--ui-shade-4)",
    style: { padding: "0 10px" }
};

function WorldListing({
    initialWorld,
    showDates,
    manageable,
    setError,
    statusClient
}: WorldListingProps) {
    const queryClient = useQueryClient();

    const [ world, setWorld ] = useState<WorldMetadata>(initialWorld);

    const [ actionPending, setActionPending ] = useState(false);

    const [ deleteModalOpen, deleteModal ] = useDisclosure();
    const [ updateModalOpen, updateModal ] = useDisclosure();

    const worldActionURLs: WorldActions = useMemo(() => ({
        host: `/api/worlds/host?code=${world.code}`,
        shutdown: `/api/worlds/shutdown?code=${world.code}`,
        delete: `/api/worlds/delete?code=${world.code}`
    }), [world]);

    async function manageWorld(action: keyof WorldActions, throws = false) {
        setActionPending(true);

        const response = await fetch(worldActionURLs[action]);

        if (!response.ok) {
            const errMessage = "An unknown error has occurred.";

            if (throws) throw new Error(errMessage);
            return setError?.(errMessage);
        }

        if (action == "delete") {
            queryClient.refetchQueries({ queryKey: ["worlds"] });
        } else {
            setWorld({ ...world, online: action == "host" });
        }

        deleteModal.close();
        setActionPending(false);
    }

    useEffect(() => {
        if (!statusClient) return;

        const statusListener = (worldCode: string, online: boolean) => {
            if (world.code == worldCode) setWorld({ ...world, online });
        };

        statusClient.on("status", statusListener);

        return () => void statusClient.off("status", statusListener);
    }, [statusClient]);

    const offlineToolbar = manageable && !world.online;
    const onlineToolbar = manageable && world.online;

    return <Container className={styles.wrapper} noShadow>
        <div>
            <Group gap="10px" fz="1.2rem">
                {world.name}

                <Tooltip
                    label={world.online ? "Online" : "Offline"}
                    withArrow
                >
                    <div className={styles.onlineIndicator} style={{
                        backgroundColor: world.online
                            ? "#3ee57e" : "#626262",
                        borderColor: world.online
                            ? "#33be68" : "#454545",
                        animationName: world.online
                            ? styles.onlinePulse : undefined
                    }}/>
                </Tooltip>
            </Group>

            <span className={styles.worldCode}>
                World Code: {world.code}
            </span>

            {showDates && <span className={styles.worldDates}>
                Created:{" "}
                {formatDate(world.createdAt)}
            </span>}

            {showDates && world.lastOnlineAt
                && <span className={styles.worldDates}>
                    Last Online:{" "}
                    {formatDate(world.lastOnlineAt)}
                </span>
            }
        </div>

        <div style={{ alignItems: "end" }}>
            {world.online && <a href={`/play/${world.code}`}>
                <Button color="green" leftSection={<IconLogin2/>}>
                    Join World
                </Button>
            </a>}

            {onlineToolbar && <Button
                color="var(--ui-shade-5)"
                loading={actionPending}
                onClick={() => manageWorld("shutdown")}
            >
                Shut Down
            </Button>}

            {offlineToolbar && <div className={styles.toolbar}>
                <Tooltip label="Delete World" withArrow>
                    <Button
                        {...toolbarButtonOptions}
                        onClick={() => deleteModal.open()}
                    >
                        <IconTrash/>
                    </Button>
                </Tooltip>
                
                <Tooltip label="Edit World" withArrow>
                    <Button
                        {...toolbarButtonOptions}
                        onClick={() => updateModal.open()}
                    >
                        <IconEdit/>
                    </Button>
                </Tooltip>
            </div>}

            {offlineToolbar && <Button
                loading={actionPending}
                onClick={() => manageWorld("host")}
                color="blue"
            >
                Host World
            </Button>}
        </div>

        <ConfirmModal
            opened={deleteModalOpen}
            onClose={() => deleteModal.close()}
            onConfirm={() => manageWorld("delete", true)}
            title="Delete World"
            confirmColour="red"
        >
            Are you sure you want to delete{" "}
            <b>{world.name}</b>
            ?
        </ConfirmModal>

        <UpsertWorldModal
            open={updateModalOpen}
            onClose={() => updateModal.close()}
            editWorld={{ ...world, squareTypes: [] }}
        />
    </Container>;
}

export default WorldListing;