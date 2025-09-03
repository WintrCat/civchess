import React from "react";
import { Button } from "@mantine/core";

import Typography from "@/components/Typography";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import { authClient } from "@/lib/auth";

import styles from "./index.module.css";

import googleIcon from "@assets/img/google.png";
import discordIcon from "@assets/img/discord.png";

function SignIn() {
    function signIn(provider: "google" | "discord") {
        const callbackOrigin = import.meta.env.DEV
            ? import.meta.env.VITE_DEV_ORIGIN : "";

        authClient.signIn.social({
            provider: provider,
            callbackURL: `${callbackOrigin}/lobby`,
            errorCallbackURL: "/signin"
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
                onClick={() => signIn("google")}
                style={{ transitionDuration: "0.3s" }}
            >
                Sign in with Google
            </Button>

            <Button
                className={styles.signInButton}
                color="var(--ui-shade-5)"
                size="md"
                leftSection={<img src={discordIcon} height={20} />}
                fullWidth
                onClick={() => signIn("discord")}
                style={{ transitionDuration: "0.3s" }}
            >
                Sign in with Discord
            </Button>

            <span className={styles.legalMessage}>
                By signing in, you agree to our Privacy Policy
                and Terms of Service.
            </span>
        </Container>

        <Footer className={styles.credit} />
    </div>;
}

export default SignIn;