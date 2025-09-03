import React from "react";

import styles from "./index.module.css";

import logo from "@assets/img/logo.png";

function Typography() {
    return <span className={styles.wrapper}>
        <img className={styles.image} src={logo} />

        <span className={styles.text}>
            CivChess
        </span>
    </span>;
}

export default Typography;