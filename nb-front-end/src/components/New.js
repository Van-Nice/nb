import React, { useState } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa"; // Importing document and folder icons
import styles from "../styles/New.module.css";

// The New component is responsible for rendering a "New" button with a dropdown menu
// that allows the user to create a new document or folder, and a modal for creating a folder.
export default function New() {
  // useState hooks to manage component state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controls whether the dropdown menu is open
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false); // Controls whether the folder creation modal is open
  const [folderName, setFolderName] = useState(""); // Stores the name of the new folder being created

  // Toggles the dropdown menu's visibility
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handles the creation of a new document
  const handleCreateFile = () => {
    console.log("Create a new document");
    // Logic to create a new file goes here
    setIsDropdownOpen(false); // Closes the dropdown menu after selecting the option
  };

  // Opens the modal for creating a new folder
  const handleCreateFolder = () => {
    setIsFolderModalOpen(true); // Opens the folder creation modal
    setIsDropdownOpen(false); // Closes the dropdown menu after selecting the option
  };

  // Closes the folder creation modal
  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
  };

  // Handles changes to the input field where the user types the folder name
  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value); // Updates the folderName state with the current input value
  };

  // Handles the folder creation process
  const handleFolderCreate = () => {
    console.log("Folder name:", folderName);
    // Logic to create the folder with the entered name goes here
    setIsFolderModalOpen(false); // Closes the modal after creating the folder
  };

  // Render the component
  return (
    <div className={styles.newWrapper}>
      {/* The main button that opens the dropdown menu */}
      <button className={styles.buttonWrapper} onClick={toggleDropdown}>
        <span className={styles.icon}>+</span>
        <span className={styles.text}>New</span>
      </button>

      {/* The dropdown menu that appears when isDropdownOpen is true */}
      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {/* Option to create a new document */}
          <div className={styles.dropdownItem} onClick={handleCreateFile}>
            <FaFileAlt className={styles.dropdownIcon} />
            <span>Create Document</span>
          </div>
          {/* Option to create a new folder */}
          <div className={styles.dropdownItem} onClick={handleCreateFolder}>
            <FaFolder className={styles.dropdownIcon} />
            <span>Create Folder</span>
          </div>
        </div>
      )}

      {/* The modal for creating a new folder, appears when isFolderModalOpen is true */}
      {isFolderModalOpen && (
        <div className={styles.modalOverlay} onClick={closeFolderModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Folder</h2>
            {/* Input field for the folder name */}
            <input
              type="text"
              value={folderName}
              onChange={handleFolderNameChange}
              placeholder="Enter folder name"
              className={styles.inputField}
            />
            {/* Modal actions: Cancel and Create buttons */}
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