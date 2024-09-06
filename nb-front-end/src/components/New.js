import React, { useState, useRef } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import styles from "../styles/New.module.css";
import FileNameModal from "./FileNameModal";

export default function New() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileNameModalRef = useRef()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    toggleDropdown()
    // Open the FileNameModal
    fileNameModalRef.current.openModal();
  };

  const handleCreateFolder = () => {
    toggleDropdown()
    // Eventually: Create new folder and route user to it - using dynamic url within home screen
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

      {/* Include the FileNameModal component */}
      <FileNameModal ref={fileNameModalRef} />
    </div>
  );
}
