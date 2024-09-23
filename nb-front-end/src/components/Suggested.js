import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import styles from '../styles/Suggested.module.css';
import { FaFileAlt, FaFolder } from 'react-icons/fa';

export default function Suggested() {
  const { folderID } = useParams(); // Get folderID from URL
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }
        const response = await fetch("http://localhost:8080/protected/folders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
          body: JSON.stringify({
            folderID: folderID || null,
          }),
        });
        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error response from server:', errorResponse);
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        setFolders(data.subFolders || []);
        setFiles(data.files || []);
      } catch (err) {
        console.error("Error fetching folder contents:", err);
        setError(err.message);
      }
    };

    fetchContents(); // Fetch contents whenever folderID changes
  }, [folderID]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {/* Display Folders */}
      {folders.length === 0 ? (
        <p>No folders found</p>
      ) : (
        <ul className={styles.fileList}>
          {folders.map((folder) => (
            <li
              key={folder.ID}
              className={`${styles.fileItem} ${
                folderID === folder._id ? styles.selected : ''
              }`}
              onClick={() => {
                navigate(`/home/folders/${folder.ID}`); // Adjusted path
              }}
            >
              <FaFolder className={styles.icon} />
              {folder.FolderName}
            </li>
          ))}
        </ul>
      )}
      {/* Display Files */}
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li
              key={file.ID}
              className={`${styles.fileItem} ${
                selectedFileId === file.ID ? styles.selected : ''
              }`}
              onClick={() => {
                setSelectedFileId(file.ID);
                navigate(`/document/${file.ID}`); // Navigate to the document editor
              }}
            >
              <FaFileAlt className={styles.icon} />
              {file.FileName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
