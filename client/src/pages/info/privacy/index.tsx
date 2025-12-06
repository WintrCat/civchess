import { Stack } from "@mantine/core";

import ReturnButton from "@/components/ReturnButton";
import Typography from "@/components/Typography";
import Container from "@/components/Container";

import styles from "./index.module.css";

function Privacy() {
    return <Stack w="100%" align="center" p="20px">
        <ReturnButton/>

        <Typography/>

        <Container className={styles.container}>
            <h1 className={styles.title}>
                Privacy Policy
            </h1>

            <h2>1. Glossary</h2>

            <span>
                1.1 "The Service", "The Website", "We", "Our", "Us" -
                the civchess.com website and any service that we
                provide that you use therein. Also the entity that
                collects information from you.
            </span>

            <span>
                1.2 "The User", "You", "Your" - The entity from whom
                we are collecting and or processing information.
            </span>

            <h2>Data we collect</h2>

            <h3>2. General</h3>

            <span>
                2.1 IP Addresses are collected to establish a
                connection between the User and the Website. In
                order to uphold security practices, we may also
                collect the following information from you when you
                visit the Website:

                <ul>
                    <li>Information about your web browser</li>
                    <li>Information about your device</li>
                    <li>Website usage data</li>
                </ul>

                2.2 For more information on what data we collect in
                this regard, you can refer to the{" "}

                <a href="https://www.cloudflare.com/en-gb/privacypolicy/">
                    Cloudflare, Inc. Privacy Policy
                </a>

                , since we use Cloudflare as a security service.
                Cloudflare is based in the United States, so by
                using the Website you agree to have your data
                processed in this country.
            </span>

            <h3>3. Accounts</h3>

            <span>
                You, while on the Website, have the option to make
                an account. You do not have to do this, although
                some services we provide cannot be used without one.

                When you sign up for an account, we collect the
                information that you explicitly provide to us in
                order to provide the Website and its services. This
                includes:

                <ul>
                    <li>Your Email Address</li>
                    <li>
                        The username and display name from the
                        service you login with
                    </li>
                    <li>
                        Your profile picture from the service you
                        login with
                    </li>
                </ul>

                This information is retained for the duration that
                you keep your account open on the Website.
            </span>

            <h2>4. Children's Privacy</h2>

            <span>
                We do not knowingly collect personal information from
                persons under the age of 13. If you think that we
                have done so, please contact us.
            </span>

            <h2>5. Your Data Rights</h2>

            <span>
                In accordance with the GDPR, you have the right to:
            </span>

            <ul>
                <li>
                    Request for a copy of the personal information
                    we hold about you.
                </li>
                <li>
                    Request for the personal information we hold
                    about you to be erased. You can do this by
                    deleting your account through your profile page.
                </li>
                <li>
                    Request for the personal information we hold
                    about you to be rectified, should you find it
                    inaccurate, incomplete or obsolete.
                </li>
            </ul>

            <h2>6. Revisions</h2>

            <span>
                Changes to this privacy policy will be announced on
                the website page. The last revision to this privacy
                policy was on 6th December 2025
            </span>

            <span>
                
            </span>

            <h2>7. Contact Us</h2>

            <span>
                If you have questions regarding this policy, or would
                like to exercise your data rights, you can contact us
                at:
            </span>

            <a href={`mailto:${import.meta.env.PUBLIC_CONTACT_EMAIL}`}>
                <p>
                    <b>{import.meta.env.PUBLIC_CONTACT_EMAIL}</b>
                </p>
            </a>
        </Container>
    </Stack>;
}

export default Privacy;