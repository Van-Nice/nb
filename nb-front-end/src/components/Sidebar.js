import React from "react";
import styles from "../styles/Sidebar.module.css"
import parentStyles from "../styles/Home.module.css"
import Bungo from "./Bungo";
import New from "./New";
import Trash from "./Trash";

export default function Sidebar() {
  return (
    <div className={parentStyles.sidebar}>
      <div className={styles.sidebarContainer}>
        <Bungo />
        <New/>
        <Trash />
      </div>
    </div>
  )
}