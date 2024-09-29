import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/FolderDropdownMenu.module.css";
import { Folder as FolderIcon, ExpandMore, ChevronRight } from '@mui/icons-material';

export default function FolderDropdownMenu({ triggerRefresh }) {
  const [folders, setFolders] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch("http://localhost:8080/protected/nested-folders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
        });

        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error response from server:', errorResponse);
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setFolders(data.folders || []); // Ensure the correct property is used
      } catch (err) {
        console.error("Error fetching folders:", err);
      }
    };

    fetchFolders();
  }, [triggerRefresh]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleFolderClick = (folderID) => {
    navigate(`/home/folders/${folderID}`);
    setIsDropdownOpen(false);
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders((prevState) => ({
      ...prevState,
      [folderId]: !prevState[folderId],
    }));
  };

  const renderFolders = (folders, level = 0) => {
    return (
      <ul className={styles.folderList}>
        {folders.map((folder) => {
          const isExpanded = expandedFolders[folder.id];
          const hasSubFolders = folder.subFolders && folder.subFolders.length > 0;
          return (
            <li key={folder.id} className={styles.folderItem}>
              <div
                className={styles.folderRow}
                style={{ paddingLeft: `${level * 20}px` }}
              >
                {hasSubFolders ? (
                  <span
                    className={styles.folderIcon}
                    onClick={() => toggleFolder(folder.id)}
                  >
                    {isExpanded ? <ExpandMore /> : <ChevronRight />}
                  </span>
                ) : (
                  <span className={styles.folderIconPlaceholder} />
                )}
                <span
                  onClick={() => handleFolderClick(folder.id)}
                  className={styles.folderName}
                >
                  <FolderIcon className={styles.folderIcon} />
                  {folder.folderName}
                </span>
              </div>
              {hasSubFolders && isExpanded && renderFolders(folder.subFolders, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.dropdownWrapper}>
      <button className={styles.buttonWrapper} onClick={toggleDropdown}>
        <span className={styles.icon}><FolderIcon /></span>
        <span className={styles.text}>Root</span>
      </button>

      {isDropdownOpen && (
        <div className={styles.dropdownMenu}>
          {folders.length === 0 ? (
            <p>No folders found</p>
          ) : (
            renderFolders(folders)
          )}
        </div>
      )}
    </div>
  );
}