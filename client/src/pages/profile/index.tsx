import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Button, Divider } from "@mantine/core";

import { StandardPieceType } from "shared/constants/StandardPieceType";
import { PublicProfile } from "shared/types/PublicProfile";
import Container from "@/components/Container";
import ProfileAvatar from "@/components/ProfileAvatar";
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

    useEffect(() => {
        if (profileStatus == "error") navigate("/404");
    }, [profileStatus])

    return <div className={styles.wrapper}>
        <Container className={styles.container} gradient>
            <div className={styles.profile}>
                <ProfileAvatar
                    avatar={profile?.avatar}
                    size={100}
                    editable={session?.user.name == username}
                />

                <div className={styles.profileData}>
                    <span className={styles.username}>
                        {profile?.name || "Loading..."}
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

                <div className={styles.manageAccountOptions}>
                    <Button>
                        Change Username
                    </Button>

                    <Button color="red">
                        Delete Account
                    </Button>
                </div>
            </>}
        </Container>
    </div>;
}

export default Profile;