
import { useNavigate } from "react-router";
import { IconUser, IconLogout } from "@tabler/icons-react";
import { Menu, LoadingOverlay } from "@mantine/core";

import ProfileAvatar from "@/components/ProfileAvatar";
import { authClient, getAvatar } from "@/lib/auth";

import styles from "./index.module.css";

interface ProfileMenuProps {
    className?: string;
}

function ProfileMenu({ className }: ProfileMenuProps) {
    const navigate = useNavigate();

    const { data: session } = authClient.useSession();

    async function signOut() {
        await authClient.signOut();
        navigate("/sign-in");
    }

    function openProfile() {
        navigate(`/profile/${session?.user.name}`);
    }
    
    return <Menu width={150} withArrow styles={{
        itemLabel: { fontSize: "1rem" }
    }}>
        <Menu.Target>
            <span className={`${styles.profile} ${className}`}>
                <LoadingOverlay
                    visible={!session?.user.name}
                    loaderProps={{ size: "sm" }}
                />

                {session?.user.name || "Loading..."}

                <ProfileAvatar size={35} avatar={session
                    ? getAvatar(session.user) : undefined
                }/>
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