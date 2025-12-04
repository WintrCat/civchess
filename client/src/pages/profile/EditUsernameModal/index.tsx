import { useEffect } from "react";
import { StatusCodes } from "http-status-codes";
import {
    Modal,
    ModalProps,
    TextInput,
    Button,
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
            return form.setFieldError("username",
                "This is already your username."
            );
        
        if (response.status == StatusCodes.CONFLICT)
            return form.setFieldError("username",
                "This username is already taken."
            );
        
        if (!response.ok)
            return form.setFieldError("username",
                await response.text() || "Unknown error occurred."
            );

        location.href = `/profile/${username}`;
    }

    return <Modal
        {...props}
        title="Change Username"
        onClose={() => {
            form.reset();
            props.onClose();
        }}
    >
        <form
            className={styles.wrapper}
            onSubmit={form.onSubmit(editUsername)}
        >
            <TextInput
                placeholder="New username..."
                {...form.getInputProps("username")}
            />

            <Group justify="end" gap="10px">
                <Button type="submit" loading={form.submitting}>
                    Save
                </Button>
            </Group>
        </form>
    </Modal>;
}

export default EditUsernameModal;