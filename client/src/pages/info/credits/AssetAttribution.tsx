import { Stack } from "@mantine/core";

import styles from "./index.module.css";

interface AssetAttributionProps {
    url: string;
    author: string;
    license: string;
}

function AssetAttribution({
    url,
    author,
    license
}: AssetAttributionProps) {
    return <Stack className={styles.assetAttribution}>
        <a href={url}>{url}</a>

        <span>{author}</span>

        <span>License: {license}</span>
    </Stack>;
}

export default AssetAttribution;