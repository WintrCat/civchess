import React, { CSSProperties, useState } from "react";
import { IconEdit } from "@tabler/icons-react";
import { LoadingOverlay } from "@mantine/core";

import { ProfileAvatar as ProfileAvatarType } from "shared/types/PublicProfile";
import { pieceImages } from "@/constants/utils";
import AvatarEditor from "./AvatarEditor";

import styles from "./index.module.css";

interface ProfileAvatarProps {
    avatar?: ProfileAvatarType;
    size?: CSSProperties["width"];
    editable?: boolean;
}

function ProfileAvatar({
    avatar = { colour: "var(--ui-shade-5)", piece: "wK" },
    size,
    editable
}: ProfileAvatarProps) {
    const [ avatarEditorOpen, setAvatarEditorOpen ] = useState(false);

    return <div className={styles.profileImage} style={{
        backgroundColor: avatar.colour
    }}>
        <LoadingOverlay visible={!avatar} />

        <img
            src={pieceImages[avatar.piece]}
            height={size || 50}
            draggable={false}
        />

        {editable && <IconEdit
            className={styles.profileImageEdit}
            size={30}
            onClick={() => setAvatarEditorOpen(true)}
        />}

        {editable && <AvatarEditor
            opened={avatarEditorOpen}
            onClose={() => setAvatarEditorOpen(false)}
        />}
    </div>;
}

export default ProfileAvatar;