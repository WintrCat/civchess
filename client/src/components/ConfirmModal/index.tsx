import React, { CSSProperties, ReactNode, useState } from "react";
import { Alert, Button, Modal, ModalProps } from "@mantine/core";

import styles from "./index.module.css";

interface ConfirmModalProps extends ModalProps {
    children: ReactNode;
    confirmLabel?: ReactNode;
    confirmColour?: CSSProperties["color"];
    cancelLabel?: ReactNode;
    onConfirm?: () => void | Promise<void>;
}

function ConfirmModal({
    opened,
    onClose,
    children,
    confirmLabel,
    confirmColour,
    cancelLabel,
    onConfirm
}: ConfirmModalProps) {
    const [ pending, setPending ] = useState(false);
    const [ error, setError ] = useState<string>();

    async function confirm() {
        setPending(true);
        
        try {
            await onConfirm?.();
        } catch (err) {
            return setError((err as Error).message);
        } finally {
            setPending(false);
        }

        onClose();
    }

    return <Modal
        opened={opened}
        onClose={onClose}
        classNames={{ body: styles.wrapper }}
    >
        <span>{children}</span>

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