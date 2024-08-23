import React from "react";
import styles from "../styles/Home.module.css";
import TextEditor from "./TextEditor";
import Bungo from "./Bungo";
import Sidebar from "./Sidebar";
import New from "./New";
import Settings from "./Settings";
import Suggested from "./Suggested";
import Search from "./Search";
import Account from "./Account";


export default function Home() {
  return (
    <div className={styles.gridContainer}>
      {/* First row + */}
      <Sidebar />
      <Search />
      <Settings />
      <Account />
      {/* Second row */}
      <Suggested />
    </div>
  );
}
