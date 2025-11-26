import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { IconHelp, IconPlus, IconEdit } from "@tabler/icons-react";
import {
    Modal,
    TextInput,
    Switch,
    Button,
    Alert,
    Checkbox,
    Tooltip,
    Group,
    Stack
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { zod4Resolver } from "mantine-form-zod-resolver";
import { StatusCodes } from "http-status-codes";

import { UserRole } from "shared/constants/UserRole";
import { WorldOptions, worldOptionsSchema } from "shared/types/world/World";
import { SquareType } from "shared/constants/SquareType";
import { biomeNames } from "@/lib/game/constants/squares";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

interface UpsertWorldModalProps {
    open: boolean;
    onClose: () => void;
    editWorld?: WorldOptions;
}

function UpsertWorldModal({
    open,
    onClose,
    editWorld
}: UpsertWorldModalProps) {
    const queryClient = useQueryClient();
    const { data: session } = authClient.useSession();

    const form = useForm<WorldOptions>({
        mode: "uncontrolled",
        initialValues: editWorld || {
            name: "",
            code: "",
            pinned: false,
            squareTypes: []
        },
        validate: zod4Resolver(worldOptionsSchema)
    });

    const [ error, setError ] = useState<string>();

    const isAdmin = useMemo(() => (
        session?.user.roles.includes(UserRole.ADMIN)
    ), [session]);

    function close() {
        form.reset();
        onClose();
    }

    async function upsertWorld(options: WorldOptions) {
        console.log("attempting upsert...");

        const upsertURL = editWorld
            ? `/api/worlds/upsert?code=${editWorld.code}`
            : "/api/worlds/upsert";

        const response = await fetch(upsertURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(options)
        });

        if (response.status == StatusCodes.FORBIDDEN)
            return setError("You do not have permission to create worlds.");

        if (response.status == StatusCodes.CONFLICT)
            return setError("A world with this world code already exists.");

        if (response.status == StatusCodes.INSUFFICIENT_STORAGE) {
            const maxWorlds: number = await response.json();

            return setError(
                `You cannot create more than ${maxWorlds} worlds.`
            );
        }

        if (!response.ok)
            return setError("An unknown error occurred.");

        await queryClient.refetchQueries({ queryKey: ["worlds"] });
        
        close();
    }

    function toggleSquareType(type: SquareType, enabled: boolean) {
        const enabledTypes = form.getValues().squareTypes;

        form.setFieldValue("squareTypes", enabled
            ? [...enabledTypes, type]
            : enabledTypes.filter(t => t != type)
        );
    }

    return <Modal
        opened={open}
        onClose={close}
        title={editWorld ? "Update world" : "Create a world"}
        closeOnClickOutside={false}
    >
        <form
            className={styles.wrapper}
            onSubmit={form.onSubmit(upsertWorld)}
        >
            <TextInput
                size="md"
                label="Name"
                placeholder="World name..."
                withAsterisk
                {...form.getInputProps("name")}
            />

            <TextInput
                size="md"
                label="World Code"
                description={
                    "This is the code that others will use"
                    + " to join your server."
                }
                placeholder="World Code..."
                withAsterisk
                {...form.getInputProps("code")}
            />

            {isAdmin && <Group gap="10px">
                <Checkbox label="Pinned" {...form.getInputProps(
                    "pinned", { type: "checkbox" })
                }/>

                <Tooltip
                    label="Pins this world to the top of the list globally."
                    withArrow
                >
                    <IconHelp
                        color="var(--ui-shade-6)"
                        cursor="help"
                        size="20"
                    />
                </Tooltip>
            </Group>}

            {!editWorld && <Stack gap="5px">
                <span>Biomes</span>

                {Object.values(SquareType).map(type => <Switch
                    key={type}
                    size="md"
                    label={biomeNames[type]}
                    onChange={event => toggleSquareType(
                        type, event.currentTarget.checked
                    )}
                />)}
            </Stack>}

            {error && <Alert variant="light" color="red">
                {error}
            </Alert>}

            <Button
                type="submit"
                size="md"
                leftSection={editWorld
                    ? <IconEdit size={26} />
                    : <IconPlus size={26} />
                }
            >
                {editWorld ? "Update World" : "Create World"}
            </Button>
        </form>
    </Modal>;
}

export default UpsertWorldModal;