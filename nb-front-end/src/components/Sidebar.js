import React from "react";
import styles from "../styles/Sidebar.module.css";
import parentStyles from "../styles/Home.module.css";
import Bungo from "./Bungo";
import New from "./New";
import Trash from "./Trash";
import FolderDropdownMenu from "./FolderDropdownMenu";

export default function Sidebar({ triggerRefresh }) {
  return (
    <div className={parentStyles.sidebar}>
      <div className={styles.sidebarContainer}>
        <Bungo />
        <New triggerRefresh={triggerRefresh} />
        <FolderDropdownMenu triggerRefresh={triggerRefresh} />
        <Trash onDropComplete={triggerRefresh} />
      </div>
    </div>
  );
}
