import React, { useEffect, useState } from "react";
import { FetchStatus } from "@tanstack/react-query";
import { Modal, ModalProps, TextInput, Button, Alert } from "@mantine/core";
import { StatusCodes } from "http-status-codes";

import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

const minUsernameLength = 3;
const maxUsernameLength = 20;

function EditUsernameModal(props: ModalProps) {
    const { data: session } = authClient.useSession();

    const [ username, setUsername ] = useState("");

    const [ status, setStatus ] = useState<FetchStatus>("idle");
    const [ error, setError ] = useState<string>();

    useEffect(() => {
        if (!session) return;
        setUsername(session.user.name);
    }, [session]);

    async function editUsername() {
        if (username.length > maxUsernameLength)
            return setError("Username must be 20 characters or less.");

        if (username.length < minUsernameLength)
            return setError("Username must be at least 3 characters.");

        if (!/^[a-z0-9_]+$/i.test(username))
            return setError(
                "Username must be alphanumeric including underscores."
            );

        setError("");
        setStatus("fetching");

        const response = await fetch("/api/account/edit-username", {
            method: "POST", body: username
        });

        if (response.status == StatusCodes.NOT_MODIFIED) {
            return setError("This is already your username.");
        } else if (response.status == StatusCodes.CONFLICT) {
            return setError("This username is already taken.");
        } else if (!response.ok) {
            return setError("Unknown error occurred.");
        }

        location.href = `/profile/${username}`;
    }

    function close() {
        setStatus("idle");
        setError(undefined);

        props.onClose();
    }

    return <Modal
        {...props}
        classNames={{ body: styles.wrapper }}
        title="Change Username"
        onClose={close}
    >
        <TextInput
            placeholder="New username..."
            value={username}
            onChange={event => setUsername(event.target.value)}
        />

        {error && <Alert variant="light" color="red">
            {error}
        </Alert>}

        <div className={styles.bottomSection}>
            <Button
                onClick={editUsername}
                loading={status == "fetching" && !error}
            >
                Save
            </Button>
        </div>
    </Modal>;
}

export default EditUsernameModal;