import React from "react";
import styles from "../styles/Sidebar.module.css"
import Bungo from "./Bungo";
import New from "./New";


// TODO: Sidebar Component: For navigation.

export default function Sidebar() {
  return (
    <div>
      <Bungo className={styles.bungo}/>
      <New className={styles.new}/>
    </div>
  )
}