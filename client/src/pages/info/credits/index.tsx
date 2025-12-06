import { Button, Stack } from "@mantine/core";
import {
    IconBrandDiscord,
    IconBrandGithub,
    IconBrandInstagram,
    IconBrandPinterest,
    IconBrandYoutube,
    IconHome
} from "@tabler/icons-react";

import ReturnButton from "@/components/ReturnButton";
import Typography from "@/components/Typography";
import CreditProfile from "./CreditProfile";
import AssetAttribution from "./AssetAttribution";

import styles from "./index.module.css";

function Credits() {
    return <div className={styles.wrapper}>
        <ReturnButton/>

        <Typography/>

        <Stack gap="20px">
            <CreditProfile
                image="/img/wintrcat.png"
                title="Developed by Wilson Crunden (wintrcat)"
                connections={[
                    {
                        icon: <IconBrandGithub/>,
                        name: "GitHub",
                        url: "https://github.com/wintrcat/civchess"
                    },
                    {
                        icon: <IconBrandYoutube/>,
                        name: "YouTube",
                        url: "https://youtube.com/@wintrcat",
                        colour: "red"
                    },
                    {
                        icon: <IconBrandDiscord/>,
                        name: "Discord",
                        url: "https://discord.com/invite/XxtsAzPyCb",
                        colour: "blue"
                    }
                ]}
            />

            <CreditProfile
                image="/img/onlinegrl.png"
                title="Original artwork by 0nlinegrl3"
                connections={[
                    {
                        icon: <IconBrandYoutube/>,
                        name: "YouTube",
                        url: "https://youtube.com/@0nlinegrl3",
                        colour: "red"
                    },
                    {
                        icon: <IconBrandInstagram/>,
                        name: "Instagram",
                        url: "https://instagram.com/0nlinegirl3",
                        colour: "pink"
                    },
                    {
                        icon: <IconBrandPinterest/>,
                        name: "Pinterest",
                        url: "https://pinterest.co.uk/0nlinegrl3",
                        colour: "red"
                    }
                ]}
            />
        </Stack>

        <h2>Other Attributions</h2>

        <AssetAttribution
            url="https://manicpixeldreamgirl.itch.io/campfire-new-32px"
            author="ManicPixelDreamGirl"
            license="Creative Commons Attribution_NoDerivatives v4.0 International"
        />
    </div>;
}

export default Credits;