import { Stack } from "@mantine/core";

import ReturnButton from "@/components/ReturnButton";
import Typography from "@/components/Typography";
import Container from "@/components/Container";

import styles from "./index.module.css";

function Terms() {
    return <Stack w="100%" align="center" p="20px">
        <ReturnButton/>

        <Typography/>

        <Container className={styles.container}>
            <h1 className={styles.title}>
                Terms of Service
            </h1>

            <h2>
                1. Introduction
            </h2>

            <span>
                civchess.com ("We", "Us", "Service(s)", "Website") is a Chess related
                multiplayer browser game. For questions about these terms, you can
                contact us via the following email address:
            </span>

            <p>
                <b>{import.meta.env.PUBLIC_CONTACT_EMAIL}</b>
            </p>

            <span>
                1.1 These terms (the "Terms") constitute a legally binding agreement between
                you, whether that be personally or on behalf of another entity ("You"),
                in regard to your use of our Services. By using the Services, you confirm
                automatically that you have read, understood and agreed to be bound by
                these Terms. If you do not agree to any of these Terms, you are expressly
                prohibited from using any of the Services.
            </span>

            <span>
                1.2 We reserve the right, in our sole discretion, to make updates to these Terms
                from time to time. If changes are made to the Terms, we will notify users
                of such amendments. We will provide the date at which the Terms were last
                revised at the bottom of this document.
            </span>

            <span>
                1.3 When amendments are made, your continued use of the Services will be subject
                to the updated Terms.
            </span>

            <span>
                1.4 We reserve the right, but not the obligation, to monitor the Services for
                violations of these Terms, as well as to take appropriate legal action against
                those who, in our sole discretion, have violated these Terms or the law.
            </span>

            <h2>
                2. General Acceptable Use
            </h2>

            <span>
                In short, while using any of the Services, you should not:

                <ul>
                    <li>2.1 Use the Services to engage in or assist others with illegal activity</li>
                    <li>
                        2.2 Use the Services to engage in spam, especially in a manner that negatively
                        impacts our infrastructure and or ability to provide the Services.
                    </li>
                    <li>2.3 Upload content over which you do not have the necessary rights to upload</li>
                    <li>2.4 Upload or distribute malware, or persuade others into doing so</li>
                    <li>2.5 Attempt to disrupt or interfere with our ability to provide the Service</li>
                    <li>
                        2.6 Use scripting or other techniques to collect data from us in a manner
                        that negatively impacts our infrastructure and or ability to provide
                        the Services
                    </li>
                    <li>
                        2.7 Attempt to access any area or information in relation to the Services that
                        you do not have express permission to access
                    </li>
                    <li>
                        2.8 Attempt to defraud us or other users, especially to gain access to sensitive
                        information, like user passwords
                    </li>
                    <li>
                        2.9 Attempt to disparage or defame, in our opinion, us or the Services
                    </li>
                    <li>
                        2.10 Harass or threaten us or other users of the Services.
                    </li>
                    <li>
                        2.11 Copy the software of any of the Services in a manner not expressly permitted by
                        its copyright license.
                    </li>
                </ul>
            </span>

            <h2>
                3. Account Registration
            </h2>

            <span>
                3.1 We reserve the right to change the username or display name of any account opened with
                the Website, for any reason or no reason, including but not limited to a breach of these
                Terms. It is at our sole discretion whether usernames or display names are offensive,
                inappropriate or otherwise objectionable.
            </span>

            <span>
                3.2 We also reserve the right to terminate any account on the Website without notice for
                a breach of the Terms or the law. We may use technological measures like IP banning to
                deny you access to the Website.
            </span>

            <h2>
                4. Third-party Websites and Content
            </h2>

            <span>
                The Services may contain links to other websites or media that belongs to
                or originates from third-party sources ("Third-Party Content"). We do not
                check any Third-Party Content for accuracy, appropriateness or completeness,
                and as such, we do not bear any responsibility for Third-Party Content that
                is accessed through the Services, nor does its inclusion therein imply any
                approval or endorsement of such Third-Party Content. If you decide to access
                any third-party Services, you do so entirely at your own risk, and without
                the government of these Terms. Therefore, we cannot be held liable for harm
                that may be caused to you in relation to accessing Third-Party Content. 
            </span>

            <h2>
                5. Privacy
            </h2>

            <span>
                Our{" "}

                <a href="/privacy">Privacy Policy</a>

                {" "}explains what kind of information we may collect from you while you use the
                Services, how we use it, and your choices in relation to data collection.
            </span>

            <h2>
                6. Limitation of Liability
            </h2>

            <span>
                The Services are provided "as is" without any warranties, express or implied.
                As such, we and our affiliates are not liable for any loss, damages or
                otherwise inconveniences caused by your use or inability to use the Services,
                nor are we liable for any feature of the Services that you find does not work
                as you expected. This includes but is not limited to the loss of data or the
                failure of the Services to operate with any other software or services.
            </span>

            <h2>
                7. Governing Law
            </h2>

            <span>
                These Terms are governed under the law of the United Kingdom, and as such any
                disputes will be heard under the courts thereof, unless mandatory law
                enforces otherwise.
            </span>

            <span>
                Last revision to this Terms of Service: 6th December 2025
            </span>
        </Container>
    </Stack>;
}

export default Terms;