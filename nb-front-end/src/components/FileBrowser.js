import React, { useState, useEffect } from 'react';
import styles from '../styles/FileBrowser.module.css'
import { useOutletContext } from 'react-router-dom';
import FileItem from './FileItem';
import FolderItem from './FolderItem';

const FileBrowser = ({ onFileSelect, onFolderSelect }) => {
  const outletContext = useOutletContext();
  const refreshKey = outletContext ? outletContext.refreshKey : null;

  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderID, setCurrentFolderID] = useState(null);
  const [history, setHistory] = useState([]); // Navigation history state
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('http://localhost:8080/protected/folders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            folderID: currentFolderID || null,
          }),
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error response from server:', errorResponse);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFolders(data.subFolders || []);
        setFiles(data.files || []);
      } catch (err) {
        console.error('Error fetching folder contents:', err);
        setError(err.message);
      }
    };

    fetchContents();
  }, [currentFolderID, refreshKey]);

  const handleFolderClick = (folderID) => {
    setHistory((prevHistory) => [...prevHistory, currentFolderID]); // Push current folder to history
    setCurrentFolderID(folderID);
  };

    // Handle back button click
    const handleBackClick = () => {
      if (history.length > 0) {
        const previousFolderID = history[history.length - 1]; // Get last folder in history
        setHistory((prevHistory) => prevHistory.slice(0, -1)); // Remove last folder from history
        setCurrentFolderID(previousFolderID); // Set current folder to previous one
      }
    };

  return (
    <div className={styles.fileBrowser}>
      {error && <div className={styles.error}>Error: {error}</div>}
      {/* Display Folders */}
      {folders.map((folder) => (
        <FolderItem
        key={folder.ID}
        folder={folder}
        onClick={() => handleFolderClick(folder.ID)}
        />
      ))}
      {/* Display Files */}
      {files.map((file) => (
        <FileItem
        key={file.ID}
        file={file}
        onClick={() => onFileSelect(file.ID)}
        />
      ))}
      {/* Back button */}
      {history.length > 0 && (
        <button className={styles.backButton} onClick={handleBackClick}>
          Back
        </button>
      )}
    </div>
  );
};

export default FileBrowser;
