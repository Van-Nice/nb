import React, { useState } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import styles from "../styles/New.module.css";


export default function New() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    toggleDropdown()
    // TODO: Create new file and route user to it - using dynamic url
    // Generate a new unique document ID (could use UUID or your backend logic)
    const newDocId = generateUUID();
    // Redirect to the new document editor page
    window.location.href = `/document/${newDocId}`;

  };

  const handleCreateFolder = () => {
    toggleDropdown()
    // TODO: Create new folder and route user to it - using dynamic url within home screen

  };

  return (
    <div className={styles.newWrapper}>
      <button className={styles.buttonWrapper} onClick={toggleDropdown}>
        <span className={styles.icon}>+</span>
        <span className={styles.text}>New</span>
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {/* Handle file */}
          <div className={styles.dropdownItem} onClick={handleCreateFile}>
            <FaFileAlt className={styles.dropdownIcon} />
            <span>Create Document</span>
          </div>
          {/* Handle folder */}
          <div className={styles.dropdownItem} onClick={handleCreateFolder}>
            <FaFolder
              className={styles.dropdownIcon}
            />
            <span>Create Folder</span>
          </div>
        </div>
      )}
    </div>
  );
}
