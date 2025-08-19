import React, { useState } from "react";
import { Modal, TextInput, Switch, Button, Alert } from "@mantine/core";

import { WorldOptions, worldOptionsSchema } from "shared/types/World";
import { SquareType } from "shared/constants/SquareType";
import { biomeNames } from "@/constants/utils";

import { CreateWorldModalProps } from "./CreateWorldModalProps";
import styles from "../index.module.css";

import createIcon from "@assets/img/create.svg";

const defaultBiomesOptions = Object.fromEntries(
    Object.values(SquareType).map(type => [type, true])
) as Record<SquareType, boolean>;

function CreateWorldModal({ open, onClose }: CreateWorldModalProps) {
    const [ worldName, setWorldName ] = useState("");
    const [ worldId, setWorldId ] = useState("");

    const [ biomesOptions, setBiomesOptions ] = useState(defaultBiomesOptions);

    const [ isPending, setIsPending ] = useState(false);
    const [ error, setError ] = useState<string>();

    function close() {
        setWorldName("");
        setWorldId("");
        setBiomesOptions(defaultBiomesOptions);
        setIsPending(false);
        setError(undefined);

        onClose();
    }

    async function createWorld(options: WorldOptions) {
        const parse = worldOptionsSchema.safeParse(options);

        if (!parse.success) return setError(
            parse.error.issues.at(0)?.message
        );

        setIsPending(true);

        const response = await fetch("/api/create-world", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options)
        });

        if (!response.ok) return setError("An unknown error occurred.");

        setIsPending(false);
        close();
    }

    return <Modal
        classNames={{ body: styles.createWorldDialog }}
        opened={open}
        onClose={close}
        centered
        title={<span className={styles.createWorldDialogTitle}>
            Create a world
        </span>}
    >
        <div>
            <span>Name</span>

            <TextInput
                size="md"
                placeholder="World name..."
                onChange={event => setWorldName(event.currentTarget.value)}
            />
        </div>

        <div>
            <span>World ID</span>

            <span style={{ fontSize: "0.7rem", color: "gray" }}>
                This is the code that others will use to join your server.
            </span>

            <TextInput
                size="md"
                placeholder="World ID..."
                onChange={event => setWorldId(event.currentTarget.value)}
            />
        </div>

        <div>
            <span>Biomes</span>

            {Object.keys(biomesOptions).map(key => <div
                className={styles.createWorldDialogSwitch}
            >
                <Switch
                    size="md"
                    display="inline-block"
                    defaultChecked
                    onChange={event => setBiomesOptions({
                        ...biomesOptions,
                        [key as SquareType]: event.currentTarget.checked
                    })}
                />

                {biomeNames[key as SquareType]}
            </div>)}
        </div>

        {error && <Alert variant="light" color="red">
            {error}
        </Alert>}

        <Button
            size="md"
            leftSection={<img src={createIcon} height={26} />}
            onClick={() => createWorld({
                name: worldName,
                id: worldId,
                widthChunks: 1,
                heightChunks: 1,
                squareTypes: Object.keys(biomesOptions).filter(
                    key => biomesOptions[key as SquareType]
                ) as SquareType[]
            })}
            loading={isPending}
        >
            Create World
        </Button>
    </Modal>;
}

export default CreateWorldModal;