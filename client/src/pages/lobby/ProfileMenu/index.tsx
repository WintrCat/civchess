import React from "react";
import { useNavigate } from "react-router";
import { IconUser, IconLogout } from "@tabler/icons-react";
import { Menu, LoadingOverlay } from "@mantine/core";

import { AuthInfer, authClient } from "@/lib/auth";

import styles from "./index.module.css";

import whiteKing from "@assets/img/pieces/wK.svg";

interface ProfileMenuProps {
    user?: AuthInfer["user"];
}

function ProfileMenu({ user }: ProfileMenuProps) {
    const navigate = useNavigate();

    async function signOut() {
        await authClient.signOut();
        navigate("/signin");
    }

    function openProfile() {
        navigate(`/profile/${user?.name}`);
    }
    
    return <Menu width={150} withArrow styles={{
        itemLabel: { fontSize: "1rem" }
    }}>
        <Menu.Target>
            <span className={styles.profile}>
                <LoadingOverlay
                    visible={!user?.name}
                    loaderProps={{ size: "sm" }}
                />

                {user?.name || "Loading..."}

                <img src={whiteKing} height={40} />
            </span>
        </Menu.Target>

        <Menu.Dropdown>
            <Menu.Item
                leftSection={<IconUser size={20}/>}
                onClick={openProfile}
            >
                Profile
            </Menu.Item>

            <Menu.Item
                leftSection={<IconLogout size={20}/>}
                onClick={signOut}
            >
                Sign out
            </Menu.Item>
        </Menu.Dropdown>
    </Menu>;
}

export default ProfileMenu;