import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Divider } from "@mantine/core";

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

    useEffect(() => {
        if (profileStatus == "error") navigate("/404");
    }, [profileStatus]);

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
                >
                    Delete Account
                </Button>
            </>}
        </Container>

        <EditUsernameModal
            opened={editUsernameOpen}
            onClose={() => setEditUsernameOpen(false)}
        />
    </div>;
}

export default Profile;