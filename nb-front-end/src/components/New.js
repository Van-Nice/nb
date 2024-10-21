import React, { useState, useRef, useContext, useEffect } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import styles from "../styles/New.module.css";
import FileNameModal from "./FileNameModal";
import FolderNameModal from "./FolderNameModal";
import { ThemeContext } from '../ThemeContext';

export default function New({ triggerRefresh }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const fileNameModalRef = useRef();
  const folderNameModalRef = useRef();
  const { theme } = useContext(ThemeContext);

  // Set data-theme attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    toggleDropdown();
    fileNameModalRef.current.openModal();
  };

  const handleCreateFolder = () => {
    toggleDropdown();
    folderNameModalRef.current.openModal();
  };

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
          <div className={styles.dropdownItem} onClick={handleCreateFolder}>
            <FaFolder className={styles.dropdownIcon} />
            <span>Create Folder</span>
          </div>
        </div>
      )}

      <FileNameModal ref={fileNameModalRef} triggerRefresh={triggerRefresh} />
      <FolderNameModal ref={folderNameModalRef} triggerRefresh={triggerRefresh} />
    </div>
  );
}
