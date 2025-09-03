import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button, ButtonProps, Tooltip } from "@mantine/core";
import { IconTrash, IconEdit, IconLogin2 } from "@tabler/icons-react";

import { WorldMetadata } from "shared/types/game/World";
import Container from "../Container";
import ConfirmModal from "../ConfirmModal";
import UpsertWorldModal from "@/components/UpsertWorldModal";
import { formatDate } from "@/lib/utils";

import styles from "./index.module.css";

interface WorldListingProps {
    worldMetadata: WorldMetadata;
    showDates?: boolean;
    manageable?: boolean;
}

const toolbarButtonOptions: ButtonProps = {
    color: "var(--ui-shade-4)",
    style: { padding: "0 10px" }
};

function WorldListing({
    worldMetadata,
    showDates,
    manageable
}: WorldListingProps) {
    const navigate = useNavigate();

    const queryClient = useQueryClient();

    const [ deleteModalOpen, setDeleteModalOpen ] = useState(false);
    const [ updateModalOpen, setUpdateModalOpen ] = useState(false);

    const [ hostPending, setHostPending ] = useState(false);
    const [ hostError, setHostError ] = useState<string>();

    const [ shutdownPending, setShutdownPending ] = useState(false);

    async function deleteWorld() {
        const response = await fetch(
            `/api/worlds/delete?code=${worldMetadata.code}`
        );
        
        if (!response.ok)
            throw new Error("An unknown error has occurred.");

        await queryClient.refetchQueries({ queryKey: ["worlds"] });

        setDeleteModalOpen(false);
    }

    async function hostWorld() {
        setHostPending(true);

        const response = await fetch(
            `/api/worlds/host?code=${worldMetadata.code}`
        );

        if (!response.ok)
            setHostError("An unknown error has occurred.");

        await queryClient.refetchQueries({ queryKey: ["worlds"] });

        setHostPending(false);
    }

    async function shutdownWorld() {
        setShutdownPending(true);

        await fetch(`/api/worlds/shutdown?code=${worldMetadata.code}`);

        await queryClient.refetchQueries({ queryKey: ["worlds"] });

        setShutdownPending(false);
    }

    const offlineToolbar = manageable && !worldMetadata.online;
    const onlineToolbar = manageable && worldMetadata.online;

    return <Container className={styles.wrapper} noShadow>
        <div>
            <span className={styles.worldName}>
                {worldMetadata.name}

                <Tooltip
                    label={worldMetadata.online ? "Online" : "Offline"}
                    withArrow
                >
                    <div className={styles.onlineIndicator} style={{
                        backgroundColor: worldMetadata.online
                            ? "#3ee57e" : "#626262",
                        borderColor: worldMetadata.online
                            ? "#33be68" : "#454545"
                    }}/>
                </Tooltip>
            </span>

            <span className={styles.worldCode}>
                World Code: {worldMetadata.code}
            </span>

            {showDates && <span className={styles.worldDates}>
                Created:{" "}
                {formatDate(worldMetadata.createdAt)}
            </span>}

            {showDates && worldMetadata.lastOnlineAt
                && <span className={styles.worldDates}>
                    Last Online:{" "}
                    {formatDate(worldMetadata.lastOnlineAt)}
                </span>
            }
        </div>

        <div style={{ alignItems: "end" }}>
            {worldMetadata.online && <a href={`/play/${worldMetadata.code}`}>
                <Button color="green" leftSection={<IconLogin2/>}>
                    Join World
                </Button>
            </a>}

            {onlineToolbar && <Button
                color="var(--ui-shade-5)"
                loading={shutdownPending}
                onClick={shutdownWorld}
            >
                Shut Down
            </Button>}

            {offlineToolbar && <div className={styles.toolbar}>
                <Tooltip label="Delete World" withArrow>
                    <Button
                        {...toolbarButtonOptions}
                        onClick={() => setDeleteModalOpen(true)}
                    >
                        <IconTrash/>
                    </Button>
                </Tooltip>
                
                <Tooltip label="Edit World" withArrow>
                    <Button
                        {...toolbarButtonOptions}
                        onClick={() => setUpdateModalOpen(true)}
                    >
                        <IconEdit/>
                    </Button>
                </Tooltip>
            </div>}

            {offlineToolbar && <Button
                loading={hostPending}
                onClick={hostWorld}
                color={hostError ? "red" : "blue"}
                disabled={!!hostError}
            >
                {hostError ? "Error" : "Host World"}
            </Button>}
        </div>

        <ConfirmModal
            opened={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={deleteWorld}
            title="Delete World"
            confirmColour="red"
        >
            Are you sure you want to delete{" "}
            <b>{worldMetadata.name}</b>
            ?
        </ConfirmModal>

        <UpsertWorldModal
            open={updateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            editWorld={worldMetadata}
        />
    </Container>;
}

export default WorldListing;