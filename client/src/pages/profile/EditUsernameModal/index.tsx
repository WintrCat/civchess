import { useEffect, useState } from "react";
import { StatusCodes } from "http-status-codes";
import {
    Modal,
    ModalProps,
    TextInput,
    Button,
    Alert,
    Group
} from "@mantine/core";
import { useForm } from "@mantine/form";

import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

const minLength = 3;
const maxLength = 20;

function EditUsernameModal(props: ModalProps) {
    const { data: session } = authClient.useSession();

    const form = useForm<{ username: string }>({
        mode: "uncontrolled",
        validate: { username: val => {
            if (val.length > maxLength)
                return `Username must be ${maxLength} characters or less`;

            if (val.length < minLength)
                return `Username must be at least ${minLength} characters.`;

            if (!/^[a-z0-9_]+$/i.test(val))
                return "Username can include A-Z, 0-9, and _";
        } }
    });

    const [ error, setError ] = useState<string>();

    useEffect(() => {
        if (!session) return;
        form.setFieldValue("username", session.user.name);
    }, [session]);

    async function editUsername() {
        const username = form.getValues().username;

        const response = await fetch("/api/account/edit-username", {
            method: "POST", body: username
        });

        if (response.status == StatusCodes.NOT_MODIFIED)
            return setError("This is already your username.");
        
        if (response.status == StatusCodes.CONFLICT)
            return setError("This username is already taken.");
        
        if (!response.ok)
            return setError("Unknown error occurred.");

        location.href = `/profile/${username}`;
    }

    function close() {
        form.reset();
        setError(undefined);

        props.onClose();
    }

    return <Modal
        {...props}
        title="Change Username"
        onClose={close}
    >
        <form
            className={styles.wrapper}
            onSubmit={form.onSubmit(editUsername)}
        >
            <TextInput
                placeholder="New username..."
                {...form.getInputProps("username")}
            />

            {error && <Alert variant="light" color="red">
                {error}
            </Alert>}

            <Group justify="end" gap="10px">
                <Button type="submit" loading={form.submitting}>
                    Save
                </Button>
            </Group>
        </form>
    </Modal>;
}

export default EditUsernameModal;