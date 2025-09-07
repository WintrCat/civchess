import React from "react";
import { IconLogin2 } from "@tabler/icons-react";
import { Button, ButtonProps } from "@mantine/core";

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
            ? import.meta.env.PUBLIC_DEV_ORIGIN
            : import.meta.env.PUBLIC_ORIGIN;

        authClient.signIn.social({
            provider: provider,
            callbackURL: `${callbackOrigin}/lobby`,
            errorCallbackURL: "/signin"
        });
    }

    async function debugSignIn() {
        const details = {
            avatarColour: "#ffffff",
            avatarPiece: "wK",
            callbackURL: "/lobby",
            email: "testing@wintrchess.com",
            name: "testing",
            password: "testingtesting",
            roles: []
        } as const satisfies Parameters<typeof authClient.signUp.email>[0];

        const registration = await authClient.signUp.email(details);

        if (!registration.error) return location.href = details.callbackURL;

        const signIn = await authClient.signIn.email(details);
        if (signIn.error) console.error(signIn.error);
    }
    
    const sharedButtonProps: ButtonProps = {
        className: styles.signInButton,
        color: "var(--ui-shade-5)",
        size: "md",
        fullWidth: true,
        style: { transitionDuration: "0.3s" }
    };

    return <div className={styles.wrapper}>
        <Typography/>

        <Container className={styles.dialog} gradient>
            <span className={styles.title}>
                Sign in to your account
            </span>

            <Button
                {...sharedButtonProps}
                leftSection={<img src={googleIcon} height={25} />}
                onClick={() => signIn("google")}
            >
                Sign in with Google
            </Button>

            <Button
                {...sharedButtonProps}
                leftSection={<img src={discordIcon} height={20} />}
                onClick={() => signIn("discord")}
            >
                Sign in with Discord
            </Button>

            {import.meta.env.DEV && <Button
                {...sharedButtonProps}
                leftSection={<IconLogin2 size={26} />}
                onClick={debugSignIn}
            >
                Debug Sign In
            </Button>}

            <span className={styles.legalMessage}>
                By signing in, you agree to our Privacy Policy
                and Terms of Service.
            </span>
        </Container>

        <Footer className={styles.credit} />
    </div>;
}

export default SignIn;