import React, { useEffect, useState } from "react";
import { IconPalette, IconChessKing } from "@tabler/icons-react";
import {
    Button,
    ColorPicker as ColourPicker,
    Modal,
    ModalProps,
    Tabs,
    TextInput
} from "@mantine/core";

import { StandardPieceType } from "shared/constants/StandardPieceType";
import ProfileAvatar from "@/components/ProfileAvatar";
import { pieceImages } from "@/constants/utils";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

function AvatarEditor(props: ModalProps) {
    const { data: session } = authClient.useSession();

    const [ colour, setColour ] = useState("#3b3e43");
    const [ piece, setPiece ] = useState<StandardPieceType>("wK");

    useEffect(() => {
        if (!session) return;

        // update state with profile data from session
    }, [session])

    return <Modal
        {...props}
        classNames={{ body: styles.wrapper, title: styles.title }}
        size="500px"
        title="Edit Avatar"
    >
        <div className={styles.editorContent}>
            {session?.user.name
                ? <ProfileAvatar size={150} colour={colour} piece={piece} />
                : <div className={styles.profileImageLoader} />
            }

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
            <Button style={{ width: "100px" }}>
                Save
            </Button>
        </div>
    </Modal>;
}

export default AvatarEditor;