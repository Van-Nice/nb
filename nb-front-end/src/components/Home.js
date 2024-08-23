import React from "react";
import styles from "../styles/Home.module.css";
import TextEditor from "./TextEditor";
import Bungo from "./Bungo";
import Sidebar from "./Sidebar";
import New from "./New";
import Suggested from "./Suggested";
import Search from "./Search";
import Account from "./Account";

export default function Home() {
  return (
    <div className={styles.gridContainer}>
      {/* First row + */}
      <Search className={styles.search}/>
      <Account className={styles.account}/>
      <Sidebar className={styles.sidebar}/> 
      {/* Second row */}
      <Suggested className={styles.suggested} />
    </div>
  );
}
