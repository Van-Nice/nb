import React, { useState } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import styles from "../styles/New.module.css";
import TextEditor from "./TextEditor";
import axios from 'axios';

export default function New() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    // TODO: Create new file and route user to it - using dynamic url
    setIsDropdownOpen(false); // Close the dropdown
  };

  const handleCreateFolder = () => {
    // TODO: Create new folder and route user to it - using dynamic url within home screen 
    setIsDropdownOpen(false);
  }

  return (
    <div className={styles.newWrapper}>
      <button className={styles.buttonWrapper} onClick={toggleDropdown}>
        <span className={styles.icon}>+</span>
        <span className={styles.text}>New</span>
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          <div className={styles.dropdownItem} onClick={handleCreateFile}>
            <FaFileAlt className={styles.dropdownIcon} />
            <span>Create Document</span>
          </div>
          <div className={styles.dropdownItem}>
            <FaFolder className={styles.dropdownIcon} onClick={handleCreateFolder}/>
            <span>Create Folder</span>
          </div>
        </div>
      )}

    </div>
  );
}