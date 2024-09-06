import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Sidebar from "./Sidebar";
import Settings from "./Settings";
import Suggested from "./Suggested";
import Search from "./Search";
import Account from "./Account";

// TODO: Center searchbar so it looks better

export default function Home() {
  const location = useLocation()
  const {user} = location.state || {};

  return (
    <div className={styles.gridContainer}>
      {/* First row + */}
      <Sidebar />
      <Search />
      <Settings user={user}/>
      <Account user={user}/>
      {/* Second row */}
      <Suggested />
    </div>
  );
}
