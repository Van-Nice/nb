import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { UserContext } from "../UserContext";
import styles from '../styles/Suggested.module.css';
import { FaFileAlt } from 'react-icons/fa';

export default function Suggested() {
  const { userID } = useContext(UserContext);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleGetFiles = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch("http://localhost:8080/protected/get-files", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
          body: JSON.stringify({
            userID: userID,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setFiles(data.files || []);
        console.log(data.files);
      } catch (error) {
        console.error("Error fetching files:", error);
        setError(error.message);
      }
    };

    handleGetFiles();
  }, [userID]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li
              key={file._id}
              className={`${styles.fileItem} ${
                selectedFileId === file._id ? styles.selected : ''
              }`}
              onClick={() => {
                setSelectedFileId(file._id); // Optional: keep if you need to track selected file
                navigate(`/document/${file._id}`); // Navigate to the document editor
              }}
            >
              <FaFileAlt className={styles.icon} />
              {file.file_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}