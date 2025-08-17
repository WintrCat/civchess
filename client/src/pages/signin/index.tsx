import React from "react";
import { Button, Anchor } from "@mantine/core";

import Typography from "@/components/Typography";
import Container from "@/components/Container";
import authClient from "@/lib/auth";

import styles from "./index.module.css";

import googleIcon from "@assets/img/google.png";

function SignIn() {
    function signIn() {
        authClient.signIn.social({
            provider: "google"
        });
    }

    return <div className={styles.wrapper}>
        <Typography/>

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

        <Container className={styles.credit}>
            ☕ Built by{" "}

            <Anchor href="https://youtube.com/@wintrcat" className="light-up">
                <u>the wintrcat community</u>
            </Anchor>
        </Container>
    </div>;
}

export default SignIn;