import React from "react";
import { Button } from "@mantine/core";

import authClient from "@/lib/auth";

import styles from "./index.module.css";

import googleIcon from "@assets/google.png?url";

function SignIn() {
    function signIn() {
        authClient.signIn.social({
            provider: "google"
        });
    }

    return <div className={styles.wrapper}>
        <div className={styles.dialog}>
            <span className={styles.title}>
                Sign in to your account
            </span>

            <Button
                className={styles.signInButton}
                color="var(--ui-shade-5)"
                size="md"
                leftSection={<img src={googleIcon} height={25} />}
                fullWidth
                onClick={signIn}
            >
                Sign in with Google
            </Button>

            <span className={styles.legalMessage}>
                By signing in, you agree to our Privacy Policy
                and Terms of Service.
            </span>
        </div>
    </div>;
}

export default SignIn;