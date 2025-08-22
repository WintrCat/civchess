import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button, ButtonProps, Tooltip } from "@mantine/core";
import { IconTrash, IconEdit } from "@tabler/icons-react";

import { WorldMetadata } from "shared/types/World";
import Container from "../Container";
import ConfirmModal from "../ConfirmModal";
import UpsertWorldModal from "@/components/UpsertWorldModal";
import { formatDate } from "@/lib/utils";

import styles from "./index.module.css";

interface WorldListingProps {
    world: WorldMetadata;
    showDates?: boolean;
    showToolbar?: boolean;
    online?: boolean;
}

const toolbarButtonOptions: ButtonProps = {
    color: "var(--ui-shade-4)",
    style: { padding: "0 10px" }
};

function WorldListing({
    world,
    showDates,
    showToolbar,
    online
}: WorldListingProps) {
    const queryClient = useQueryClient();

    const [ deleteModalOpen, setDeleteModalOpen ] = useState(false);
    const [ updateModalOpen, setUpdateModalOpen ] = useState(false);

    async function deleteWorld() {
        const response = await fetch(
            `/api/worlds/delete?code=${world.code}`
        );
        
        if (!response.ok) throw new Error(
            "An unknown error has occurred."
        );

        await queryClient.refetchQueries({ queryKey: ["worlds"] });
    }

    return <Container className={styles.wrapper} noShadow>
        <div>
            <span className={styles.worldName}>
                {world.name}

                <Tooltip label={online ? "Online" : "Offline"} withArrow>
                    <div className={styles.onlineIndicator} style={{
                        backgroundColor: online ? "#3ee57e" : "#626262",
                        borderColor: online ? "#33be68" : "#454545"
                    }}/>
                </Tooltip>
            </span>

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

        <div style={{
            alignItems: "end",
            justifyContent: showToolbar ? "start" : "center"
        }}>
            {showToolbar && <div className={styles.toolbar}>
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

            {showToolbar && <Button>
                Host World
            </Button>}
        </div>

        <ConfirmModal
            opened={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={deleteWorld}
            confirmColour="red"
        >
            Are you sure you want to delete{" "}
            <b>{world.name}</b>
            ?
        </ConfirmModal>

        <UpsertWorldModal
            open={updateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            editWorld={world}
        />
    </Container>;
}

export default WorldListing;