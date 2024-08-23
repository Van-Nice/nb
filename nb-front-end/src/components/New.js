import React, { useState } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa"; // Importing document and folder icons
import styles from "../styles/New.module.css";

export default function New() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    console.log("Create a new document");
    // Logic to create a new file goes here
    setIsDropdownOpen(false);
  };

  const handleCreateFolder = () => {
    setIsFolderModalOpen(true);
    setIsDropdownOpen(false);
  };

  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleFolderCreate = () => {
    console.log("Folder name:", folderName);
    // Logic to create the folder goes here
    setIsFolderModalOpen(false);
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

      {isFolderModalOpen && (
        <div className={styles.modalOverlay} onClick={closeFolderModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Folder</h2>
            <input
              type="text"
              value={folderName}
              onChange={handleFolderNameChange}
              placeholder="Enter folder name"
              className={styles.inputField}
            />
            <div className={styles.modalActions}>
              <button className={styles.closeButton} onClick={closeFolderModal}>
                Cancel
              </button>
              <button className={styles.createButton} onClick={handleFolderCreate}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}