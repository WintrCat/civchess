import React, { useState } from "react";
import { Modal, TextInput, Switch, Button } from "@mantine/core";

import { WorldOptions } from "shared/types/World";
import { SquareType } from "shared/constants/SquareType";
import { biomeNames } from "@/constants/utils";

import { CreateWorldModalProps } from "./CreateWorldModalProps";
import styles from "../index.module.css";

import createIcon from "@assets/img/create.svg";

type BiomesOptions = Record<SquareType, boolean>;

function CreateWorldModal({ open, onClose }: CreateWorldModalProps) {
    const [ worldName, setWorldName ] = useState("");
    const [ worldId, setWorldId ] = useState("");

    const [
        biomesOptions,
        setBiomesOptions
    ] = useState<BiomesOptions>(
        Object.fromEntries(Object.values(SquareType)
            .map(type => [type, true])
        ) as BiomesOptions
    );

    function createWorld(options: WorldOptions) {
        fetch("/api/create-world", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options)
        });
    }

    return <Modal
        classNames={{
            body: styles.createWorldDialog
        }}
        opened={open}
        onClose={onClose}
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
        >
            Create World
        </Button>
    </Modal>;
}

export default CreateWorldModal;