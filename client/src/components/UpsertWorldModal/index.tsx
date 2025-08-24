import React, { useEffect, useState, useMemo } from "react";
import { IconHelp, IconPlus, IconEdit } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { remove } from "es-toolkit";
import { produce } from "immer";
import {
    Modal, TextInput, Switch,
    Button, Alert, Checkbox,
    Tooltip
} from "@mantine/core";

import { UserRole } from "shared/constants/UserRole";
import { WorldOptions, worldOptionsSchema } from "shared/types/World";
import { SquareType } from "shared/constants/SquareType";
import { biomeNames } from "@/constants/utils";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

interface UpsertWorldModalProps {
    open: boolean;
    onClose: () => void;
    editWorld?: WorldOptions;
}

const pinWorldTooltip = "Pins this world to the top of the list globally.";

const defaultWorldOptions: WorldOptions = {
    name: "",
    code: "",
    squareTypes: Object.values(SquareType)
};

function UpsertWorldModal({
    open,
    onClose,
    editWorld
}: UpsertWorldModalProps) {
    const queryClient = useQueryClient();

    const { data: session } = authClient.useSession();

    const isUserAdmin = useMemo(() => (
        session?.user.roles.includes(UserRole.ADMIN)
    ), [session?.user.id]);

    const [
        worldOptions,
        setWorldOptions
    ] = useState<WorldOptions>(defaultWorldOptions);

    const [ pending, setPending ] = useState(false);
    const [ error, setError ] = useState<string>();

    useEffect(() => {
        if (editWorld) setWorldOptions(editWorld);
    }, [editWorld]);

    useEffect(() => {
        if (error) setPending(false);
    }, [error])

    function close() {
        if (!editWorld) setWorldOptions(defaultWorldOptions);

        setPending(false);
        setError(undefined);

        onClose();
    }

    async function upsertWorld(options: WorldOptions) {
        const parse = worldOptionsSchema.safeParse(options);

        if (!parse.success) return setError(
            parse.error.issues.at(0)?.message
        );

        setPending(true);

        const response = await fetch("/api/worlds/upsert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options)
        });

        if (!response.ok) return setError("An unknown error occurred.");

        await queryClient.refetchQueries({ queryKey: ["worlds"] });
        
        close();
    }

    return <Modal
        classNames={{ body: styles.wrapper, title: styles.title }}
        opened={open}
        onClose={close}
        centered
        title={editWorld ? "Update world" : "Create a world"}
    >
        <div>
            <span>Name</span>

            <TextInput
                size="md"
                placeholder="World name..."
                value={worldOptions.name}
                onChange={event => setWorldOptions(prev => ({
                    ...prev, name: event.target.value
                }))}
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
                value={worldOptions.code}
                onChange={event => setWorldOptions(prev => ({
                    ...prev, code: event.target.value
                }))}
            />
        </div>

        {isUserAdmin && <div
            className={styles.switch}
        >
            <span style={{ color: "#c1c1c1" }}>
                Pinned
            </span>

            <Checkbox
                checked={worldOptions.pinned || false}
                onChange={event => setWorldOptions(prev => ({
                    ...prev, pinned: event.target.checked
                }))}
            />

            <Tooltip label={pinWorldTooltip} withArrow>
                <IconHelp color="var(--ui-shade-6)" cursor="help" size="20"/>
            </Tooltip>
        </div>}

        {!editWorld && <div>
            <span>Biomes</span>

            {Object.values(SquareType).map(type => <div
                className={styles.switch}
                key={type}
            >
                <Switch
                    size="md"
                    display="inline-block"
                    checked={worldOptions.squareTypes?.includes(type) || false}
                    onChange={event => setWorldOptions(
                        produce(worldOptions, draft => {
                            draft.squareTypes ??= [];
                            
                            if (event.target.checked) {
                                draft.squareTypes.push(type)
                            } else {
                                remove(draft.squareTypes, t => t == type);
                            }

                            return draft;
                        })
                    )}
                />

                {biomeNames[type]}
            </div>)}
        </div>}

        {error && <Alert variant="light" color="red">
            {error}
        </Alert>}

        <Button
            size="md"
            leftSection={editWorld
                ? <IconEdit size={26} />
                : <IconPlus size={26} />
            }
            onClick={() => upsertWorld(worldOptions)}
            loading={pending}
        >
            {editWorld ? "Update World" : "Create World"}
        </Button>
    </Modal>;
}

export default UpsertWorldModal;