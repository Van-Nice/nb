import React, {useState} from "react";
import { Outlet } from "react-router-dom";
import styles from "../styles/Home.module.css";
import Sidebar from "./Sidebar";
import Settings from "./Settings";
import Suggested from "./Suggested";
import Search from "./Search";
import Account from "./Account";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DndProvider } from 'react-dnd';

export default function Home() {
  const [refresh, setRefresh] = useState(false);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.gridContainer}>
        {/* First row + */}
        <Sidebar />
        <Search />
        <Settings/>
        <Account/>
        {/* Render child routes here */}
        <Outlet />
      </div>
    </DndProvider>
  );
}
