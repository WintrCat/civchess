import React from "react";
import { Button } from "@mantine/core";

import Container from "@/components/Container";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

import googleIcon from "@assets/img/google.png";
import CreditContainer from "@/components/CreditContainer";

function SignIn() {
    function signIn() {
        const callbackOrigin = import.meta.env.DEV
            ? import.meta.env.VITE_DEV_ORIGIN : "";

        authClient.signIn.social({
            provider: "google",
            callbackURL: `${callbackOrigin}/lobby`,
            errorCallbackURL: "/signin"
        });
    }

    return <div className={styles.wrapper}>
        <span className={styles.typography}>
            CivChess
        </span>

        <Container className={styles.dialog} gradient>
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
                style={{ transitionDuration: "0.3s" }}
            >
                Sign in with Google
            </Button>

            <span className={styles.legalMessage}>
                By signing in, you agree to our Privacy Policy
                and Terms of Service.
            </span>
        </Container>

        <CreditContainer className={styles.credit} />
    </div>;
}

export default SignIn;