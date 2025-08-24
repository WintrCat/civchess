import React, { CSSProperties, useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import { LoadingOverlay } from "@mantine/core";

import { StandardPieceType } from "shared/constants/StandardPieceType";
import { pieceImages } from "@/constants/utils";
import AvatarEditor from "./AvatarEditor";

import styles from "./index.module.css";

interface ProfileAvatarProps {
    colour?: string;
    piece?: StandardPieceType;
    loading?: boolean;
    size?: CSSProperties["width"];
    editable?: boolean;
}

function ProfileAvatar({
    colour = "var(--ui-shade-5)",
    piece = "wK",
    loading,
    size,
    editable
}: ProfileAvatarProps) {
    const [ avatarEditorOpen, setAvatarEditorOpen ] = useState(false);

    return <div className={styles.profileImage} style={{
        backgroundColor: colour
    }}>
        <LoadingOverlay visible={loading} />

        <img
            src={pieceImages[piece]}
            height={size}
            draggable={false}
        />

        {editable && <IconEdit
            className={styles.profileImageEdit}
            size={30}
            onClick={() => setAvatarEditorOpen(true)}
        />}

        <AvatarEditor
            opened={avatarEditorOpen}
            onClose={() => setAvatarEditorOpen(false)}
        />
    </div>;
}

export default ProfileAvatar;