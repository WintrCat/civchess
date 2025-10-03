import React, { useEffect, useState } from "react";
import { QueryStatus, useQueryClient } from "@tanstack/react-query";
import { IconPalette, IconChessKing } from "@tabler/icons-react";
import {
    Button,
    ColorPicker as ColourPicker,
    Modal,
    ModalProps,
    Tabs,
    TextInput
} from "@mantine/core";

import { ProfileAvatar } from "shared/types/PublicProfile";
import { StandardPieceType } from "shared/constants/PieceType";
import ProfileAvatarUI from "@/components/ProfileAvatar";
import { pieceImages } from "@/constants/utils";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

type Status = QueryStatus | "idle";

function AvatarEditor(props: ModalProps) {
    const queryClient = useQueryClient();

    const { data: session } = authClient.useSession();

    const [ colour, setColour ] = useState("#3b3e43");
    const [ piece, setPiece ] = useState<StandardPieceType>("wK");

    const [ status, setStatus ] = useState<Status>("idle");

    useEffect(() => {
        if (!session) return;

        setColour(session.user.avatarColour);
        setPiece(session.user.avatarPiece as StandardPieceType);
    }, [session]);

    async function saveAvatar() {
        setStatus("pending");

        const response = await fetch("/api/account/edit-avatar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                colour, piece
            } satisfies ProfileAvatar)
        });

        if (!response.ok) return setStatus("error");

        await queryClient.refetchQueries({
            queryKey: ["profile", session?.user.name]
        });

        setStatus("success");
    }

    return <Modal
        {...props}
        classNames={{ body: styles.wrapper, title: styles.title }}
        size="500px"
        title="Edit Avatar"
        onClose={() => {
            setStatus("idle");
            props.onClose();
        }}
    >
        <div className={styles.editorContent}>
            <div style={{ flexShrink: 0 }}>
                {session?.user.name
                    ? <ProfileAvatarUI size={150} avatar={{ colour, piece }} />
                    : <div className={styles.profileImageLoader} />
                }
            </div>

            <Tabs defaultValue="colour" classNames={{
                root: styles.tabsRoot, panel: styles.panel
            }}>
                <Tabs.List grow>
                    <Tabs.Tab value="colour" leftSection={
                        <IconPalette/>
                    }>
                        Colour
                    </Tabs.Tab>

                    <Tabs.Tab value="piece" leftSection={
                        <IconChessKing/>
                    }>
                        Piece
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="colour" className={styles.colourPanel}>
                    <ColourPicker
                        fullWidth
                        value={colour}
                        onChange={setColour}
                    />

                    <TextInput
                        value={colour}
                        onChange={event => setColour(event.target.value)}
                        placeholder="Colour..."
                        maxLength={7}
                    />
                </Tabs.Panel>

                <Tabs.Panel value="piece" className={styles.piecePanel}>
                    {Object.entries(pieceImages).map(([ type, icon ]) => <img
                        className={styles.piecePreview}
                        style={{ boxShadow: "0 0 0 2px "
                            + (type == piece ? "#3d8bff" : "#ffffff05")
                            + " inset"
                        }}
                        height={75}
                        src={icon}
                        onClick={() => setPiece(type as StandardPieceType)}
                        draggable={false}
                    />)}
                </Tabs.Panel>
            </Tabs>
        </div>

        <div className={styles.bottomSection}>
            {status == "success" && <span style={{ color: "#52ff52" }}>
                Saved successfully.    
            </span>}

            {status == "error" && <span style={{ color: "#ff4242" }}>
                Failed to save avatar.
            </span>}

            <Button
                style={{ width: "100px" }}
                loading={status == "pending"}
                onClick={saveAvatar}
            >
                Save
            </Button>
        </div>
    </Modal>;
}

export default AvatarEditor;