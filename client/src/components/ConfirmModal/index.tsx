import React, { CSSProperties, ReactNode, useState } from "react";
import { Alert, Button, Modal, ModalProps, TextInput } from "@mantine/core";

import styles from "./index.module.css";

interface ConfirmModalProps extends ModalProps {
    children: ReactNode;
    confirmationCode?: string;
    confirmLabel?: ReactNode;
    confirmColour?: CSSProperties["color"];
    cancelLabel?: ReactNode;
    onConfirm?: () => void | Promise<void>;
}

function ConfirmModal(props: ConfirmModalProps) {
    const {
        onClose,
        children,
        confirmationCode,
        confirmLabel,
        confirmColour,
        cancelLabel,
        onConfirm
    } = props;

    const [ confirmation, setConfirmation ] = useState("");

    const [ pending, setPending ] = useState(false);
    const [ error, setError ] = useState<string>();

    async function confirm() {
        if (confirmationCode && confirmationCode != confirmation)
            return setError("Incorrect confirmation code.");

        setPending(true);
        
        try {
            await onConfirm?.();
            setError(undefined);
        } catch (err) {
            setError((err as Error).message);
        }

        setPending(false);
    }

    function close() {
        setConfirmation("");
        setPending(false);
        setError(undefined);

        onClose();
    }

    return <Modal
        {...props}
        classNames={{ body: styles.wrapper }}
        onClose={close}
    >
        <span>{children}</span>

        {confirmationCode && <TextInput
            placeholder={`${confirmationCode}...`}
            value={confirmation}
            onChange={event => setConfirmation(event.target.value)}
        />}

        {error && <Alert variant="light" color="red">
            {error}
        </Alert>}

        <div className={styles.options}>
            <Button onClick={confirm} loading={pending} color={confirmColour}>
                {confirmLabel || "Yes"}
            </Button>

            <Button color="var(--ui-shade-4)" onClick={onClose}>
                {cancelLabel || "No"}
            </Button>
        </div>
    </Modal>;
}

export default ConfirmModal;