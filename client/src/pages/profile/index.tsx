import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Code, Divider, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEdit } from "@tabler/icons-react";

import { PublicProfile } from "shared/types/PublicProfile";
import Container from "@/components/Container";
import ConfirmModal from "@/components/ConfirmModal";
import ProfileAvatar from "@/components/ProfileAvatar";
import EditUsernameModal from "./EditUsernameModal";
import { useServerState } from "@/hooks/useServerState";
import { userRoleDisplays } from "@/constants/utils";
import { formatDate } from "@/lib/utils";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

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

    const [ editUsernameOpen, editUsernameModal ] = useDisclosure();
    const [ deleteAccountOpen, deleteAccountModal ] = useDisclosure();

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
            <Group gap="10px" align="start">
                <ProfileAvatar
                    avatar={profile?.avatar}
                    size={100}
                    editable={editable}
                />

                <Stack gap="5px" align="start">
                    <Group fz="1.4rem" gap="5px">
                        {profile?.name || "Loading..."}

                        {editable && <IconEdit
                            className={styles.usernameEdit}
                            size={26}
                            onClick={() => editUsernameModal.open()}
                        />}
                    </Group>

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
                </Stack>
            </Group>

            {session?.user.name == username && <>
                <Divider label="MANAGE ACCOUNT"/>

                <Button color="red" w="min-content" onClick={
                    () => deleteAccountModal.open()
                }>
                    Delete Account
                </Button>
            </>}
        </Container>

        <EditUsernameModal
            opened={editUsernameOpen}
            onClose={() => editUsernameModal.close()}
        />

        <ConfirmModal
            opened={deleteAccountOpen}
            onClose={() => deleteAccountModal.close()}
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