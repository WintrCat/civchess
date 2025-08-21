import React from "react";
import { Dialog, DialogProps } from "@mantine/core";

interface ConfirmDialogProps extends DialogProps {
    prompt: string;
    confirmLabel?: string;
    cancelLabel?: string;
}