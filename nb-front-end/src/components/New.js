import React, { useState } from "react";
import { FaFileAlt, FaFolder } from "react-icons/fa";
import styles from "../styles/New.module.css";
import TextEditor from "./TextEditor";
import axios from 'axios';

export default function New() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleCreateFile = () => {
    setIsEditorOpen(true); // Open the text editor view
    setIsDropdownOpen(false); // Close the dropdown
  };

  const closeEditor = () => {
    setIsEditorOpen(false); // Close the text editor view
  };

  const handleFileSave = async (content) => {
    // Prepare the data for the new file
    const newFile = {
      user_id: "your-user-id", // Replace with the actual user ID
      folder_id: "optional-folder-id", // Replace with the folder ID if needed
      name: fileName,
      content: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Send the data to your backend to save in MongoDB
      const response = await axios.post("/api/files", newFile);
      console.log("File saved with ID:", response.data.result);
      // Handle success (e.g., show a notification, update UI, etc.)
    } catch (error) {
      console.error("Error saving file:", error);
      // Handle error (e.g., show an error message)
    }

    setIsEditorOpen(false); // Close the editor after saving
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
          <div className={styles.dropdownItem}>
            <FaFolder className={styles.dropdownIcon} />
            <span>Create Folder</span>
          </div>
        </div>
      )}

      {isEditorOpen && (
        <div className={styles.modalOverlay} onClick={closeEditor}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Create New Document</h2>
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter document name"
              className={styles.inputField}
            />
            <TextEditor onSave={handleFileSave} />
          </div>
        </div>
      )}
    </div>
  );
}