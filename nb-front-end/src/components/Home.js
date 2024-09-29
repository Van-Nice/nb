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
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.gridContainer}>
        {/* First row + */}
        <Sidebar triggerRefresh={triggerRefresh}/>
        <Search />
        <Settings/>
        <Account/>
        {/* Render child routes here */}
        <Outlet context={refreshKey} />
      </div>
    </DndProvider>
  );
}
