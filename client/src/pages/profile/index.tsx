import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Code, Divider } from "@mantine/core";

import { PublicProfile } from "shared/types/PublicProfile";
import Container from "@/components/Container";
import ProfileAvatar from "@/components/ProfileAvatar";
import EditUsernameModal from "./EditUsernameModal";
import { useServerState } from "@/hooks/useServerState";
import { userRoleDisplays } from "@/constants/utils";
import { formatDate } from "@/lib/utils";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";
import { IconEdit } from "@tabler/icons-react";
import ConfirmModal from "@/components/ConfirmModal";

function Profile() {
    const navigate = useNavigate();
    const { username } = useParams();

    const { data: session } = authClient.useSession();

    const {
        data: profile, status: profileStatus
    } = useServerState<PublicProfile>(
        `/api/public-profile?username=${username}`,
        { queryKey: ["profile", username], retry: false }
    );

    const [ editUsernameOpen, setEditUsernameOpen ] = useState(false);
    const [ deleteAccountOpen, setDeleteAccountOpen ] = useState(false);

    useEffect(() => {
        if (profileStatus == "error") navigate("/404");
    }, [profileStatus]);

    async function deleteAccount() {
        const result = await authClient.deleteUser();

        if (result.error) throw new Error("Unknown error occurred.");

        navigate("/sign-in");
    }

    const editable = session?.user.name == username;

    return <div className={styles.wrapper}>
        <Container className={styles.container} gradient>
            <div className={styles.profile}>
                <ProfileAvatar
                    avatar={profile?.avatar}
                    size={100}
                    editable={editable}
                />

                <div className={styles.profileData}>
                    <span className={styles.username}>
                        {profile?.name || "Loading..."}

                        {editable && <IconEdit
                            className={styles.usernameEdit}
                            size={26}
                            onClick={() => setEditUsernameOpen(true)}
                        />}
                    </span>

                    {profile?.roles.map(role => <span
                        className={styles.role}
                        style={{
                            backgroundColor: userRoleDisplays[role].color
                        }}
                    >
                        {userRoleDisplays[role].name}
                    </span>)}

                    <span className={styles.createdAt}>
                        Created at:{" "}

                        {profile?.createdAt
                            ? formatDate(profile.createdAt)
                            : "Loading..."
                        }
                    </span>
                </div>
            </div>

            {session?.user.name == username && <>
                <Divider label="MANAGE ACCOUNT"/>

                <Button
                    color="red"
                    style={{ width: "min-content" }}
                    onClick={() => setDeleteAccountOpen(true)}
                >
                    Delete Account
                </Button>
            </>}
        </Container>

        <EditUsernameModal
            opened={editUsernameOpen}
            onClose={() => setEditUsernameOpen(false)}
        />

        <ConfirmModal
            opened={deleteAccountOpen}
            onClose={() => setDeleteAccountOpen(false)}
            onConfirm={deleteAccount}
            title="Delete Account"
            confirmationCode={session?.user.name}
            confirmLabel="Delete"
            confirmColour="red"
            cancelLabel="Cancel"
        >
            Please confirm the deletion of your account by
            typing your username,{" "}

            <Code style={{ fontSize: "1rem" }}>
                <b>{session?.user.name}</b>
            </Code>

            , into the field below:
        </ConfirmModal>
    </div>;
}

export default Profile;