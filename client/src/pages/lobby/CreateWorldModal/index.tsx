import React, { useEffect, useState, useMemo } from "react";
import { IconHelp, IconPlus } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import {
    Modal, TextInput, Switch,
    Button, Alert, Checkbox,
    Tooltip
} from "@mantine/core";

import { UserRole } from "shared/constants/UserRole";
import { WorldOptions, worldOptionsSchema } from "shared/types/World";
import { SquareType } from "shared/constants/SquareType";
import { biomeNames } from "@/constants/utils";
import authClient from "@/lib/auth";

import styles from "../index.module.css";

interface CreateWorldModalProps {
    open: boolean;
    onClose: () => void;
}

const pinWorldTooltip = "Pins this world to the top of the list globally.";

const defaultBiomesOptions = Object.fromEntries(
    Object.values(SquareType).map(type => [type, true])
) as Record<SquareType, boolean>;

function CreateWorldModal({ open, onClose }: CreateWorldModalProps) {
    const queryClient = useQueryClient();

    const { data: session } = authClient.useSession();

    const isUserAdmin = useMemo(() => (
        session?.user.roles.includes(UserRole.ADMIN)
    ), [session?.user.id]);

    const [ worldName, setWorldName ] = useState("");
    const [ worldCode, setWorldCode ] = useState("");
    const [ pinned, setPinned ] = useState(false);

    const [ biomesOptions, setBiomesOptions ] = useState(defaultBiomesOptions);

    const [ pending, setPending ] = useState(false);
    const [ error, setError ] = useState<string>();

    useEffect(() => {
        if (error) setPending(false);
    }, [error])

    function close() {
        setWorldName("");
        setWorldCode("");
        setPinned(false);
        setBiomesOptions(defaultBiomesOptions);
        setPending(false);
        setError(undefined);

        onClose();
    }

    async function createWorld(options: WorldOptions) {
        const parse = worldOptionsSchema.safeParse(options);

        if (!parse.success) return setError(
            parse.error.issues.at(0)?.message
        );

        setPending(true);

        const response = await fetch("/api/worlds/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options)
        });

        if (!response.ok) return setError("An unknown error occurred.");

        await queryClient.refetchQueries({ queryKey: ["worlds"] });
        
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
            <span>World Code</span>

            <span style={{ fontSize: "0.7rem", color: "gray" }}>
                This is the code that others will use to join your server.
            </span>

            <TextInput
                size="md"
                placeholder="World Code..."
                onChange={event => setWorldCode(event.currentTarget.value)}
            />
        </div>

        {isUserAdmin && <div
            className={styles.createWorldDialogSwitch}
        >
            <span style={{ color: "#c1c1c1" }}>
                Pinned
            </span>

            <Checkbox checked={pinned} onChange={event => setPinned(
                event.currentTarget.checked
            )}/>

            <Tooltip label={pinWorldTooltip} withArrow>
                <IconHelp color="var(--ui-shade-6)" cursor="help" size="20"/>
            </Tooltip>
        </div>}

        <div>
            <span>Biomes</span>

            {Object.keys(biomesOptions).map(key => <div
                className={styles.createWorldDialogSwitch}
                key={key}
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
            leftSection={<IconPlus size={26} />}
            onClick={() => createWorld({
                name: worldName,
                code: worldCode,
                pinned: pinned,
                widthChunks: 1,
                heightChunks: 1,
                squareTypes: Object.keys(biomesOptions).filter(
                    key => biomesOptions[key as SquareType]
                ) as SquareType[]
            })}
            loading={pending}
        >
            Create World
        </Button>
    </Modal>;
}

export default CreateWorldModal;