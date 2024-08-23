import React from "react";
import styles from "../styles/New.module.css";
import File from "./File";
import Folder from "./Folder";

// TODO: New button for creating new files and folders
// TODO: Create logic for new files and folders

export default function New() {
  return (
    <button className={styles.buttonWrapper}>
      <span className={styles.icon}>+</span>
      <span className={styles.text}>New</span>
    </button>
  )
}