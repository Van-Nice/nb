import React from "react";
import styles from "../styles/Home.module.css";
import Sidebar from "./Sidebar";
import Settings from "./Settings";
import Suggested from "./Suggested";
import Search from "./Search";
import Account from "./Account";

// Planning:



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
