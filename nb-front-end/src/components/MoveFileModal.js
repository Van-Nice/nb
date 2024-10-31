import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import styles from '../styles/MoveFileModal.module.css';
import FolderItem from './FolderItem';

const MoveFileModal = forwardRef(({ onMove }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folders, setFolders] = useState([]);
  const [currentFolderID, setCurrentFolderID] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsModalOpen(true);
      setCurrentFolderID(null);
      setHistory([]);
    },
  }));

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No token found');
        }

        const response = await fetch('https://api.bungo.rocks/protected/folders', {
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
      } catch (err) {
        console.error('Error fetching folders:', err);
        setError(err.message);
      }
    };

    fetchFolders();
  }, [currentFolderID]);

  const handleFolderClick = (folderID) => {
    setHistory((prevHistory) => [...prevHistory, currentFolderID]);
    setCurrentFolderID(folderID);
  };

  const handleBackClick = () => {
    if (history.length > 0) {
      const previousFolderID = history[history.length - 1];
      setHistory((prevHistory) => prevHistory.slice(0, -1));
      setCurrentFolderID(previousFolderID);
    }
  };

  const handleMoveClick = () => {
    onMove(currentFolderID);
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Select Destination Folder</h2>
            {error && <div className={styles.error}>Error: {error}</div>}
            <div className={styles.folderList}>
              {folders.map((folder) => (
                <FolderItem
                key={folder.ID}
                folder={folder}
                onClick={() => handleFolderClick(folder.ID)}
                />
              ))}
            </div>
            <div className={styles.buttonGroup}>
              {/* Left buttons */}
              <div className={styles.leftButton}>
                <button className={styles.cancelButton} onClick={closeModal}>
                  Cancel
                </button>
                {history.length > 0 && (
                  <button className={styles.backButton} onClick={handleBackClick}>
                    Back
                  </button>
                )}
              </div>
              {/* Right buttons */}
              <div className={styles.rightButtons}>
                <button className={styles.moveButton} onClick={handleMoveClick}>
                  Move Here
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default MoveFileModal;
