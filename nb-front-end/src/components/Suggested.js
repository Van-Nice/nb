import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams, useLocation, useOutletContext } from 'react-router-dom';
import styles from '../styles/Suggested.module.css';
import DraggableFolder from "./DraggableFolder";
import DraggableFile from "./DraggableFile";
import { ThemeContext } from "../ThemeContext";

export const ItemTypes = {
  FOLDER: 'folder',
  FILE: 'file',
};

export default function Suggested({selectedFile}) {
  const { folderID } = useParams(); // Get folderID from URL
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();
  const [dropEvent, setDropEvent] = useState(0);
  const location = useLocation();
  const { refreshKey } = useOutletContext();
  const {theme} = useContext(ThemeContext);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }
  
        let response;
        console.log(folderID);
        if (location.pathname === '/home/trash') {
          // Fetch deleted items
          response = await fetch("http://localhost:8080/protected/deleted-items", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token}`,
            },
          });
        } else {
          // Fetch normal folder contents
          response = await fetch("http://localhost:8080/protected/folders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `${token}`,
            },
            body: JSON.stringify({
              folderID: folderID || null,
            }),
          });
        }
  
        if (!response.ok) {
          const errorResponse = await response.json();
          console.error('Error response from server:', errorResponse);
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log("Fetched data:", data);
        console.log("locations.pathname = ", location.pathname);
        if (location.pathname === '/home/trash') {
          console.log("Should be loading trash")
          // Update state with deleted items
          setFolders(data.deletedFolders || []);
          setFiles(data.deletedFiles || []);
        } else {
          // Update state with normal items
          setFolders(data.subFolders || []);
          setFiles(data.files || []);
        }
      } catch (err) {
        console.error("Error fetching folder contents:", err);
        setError(err.message);
      }
    };
  
    fetchContents();
  }, [folderID, dropEvent, location, refreshKey]);

  const handleDrop = async (item, targetFolder) => {
    console.log(`Dropped item ${item.id} into folder ${targetFolder.ID}`);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }
      const requestBody = JSON.stringify({
        itemID: item.id,
        targetFolderID: targetFolder.ID,
        itemType: item.type,
      });
  
      const response = await fetch('http://localhost:8080/protected/move-item', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: requestBody,
      });
  
      // Log the raw response text
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
  
      if (!response.ok) {
        console.error('Error response from server:', responseText);
        throw new Error('Network response was not ok');
      }
  
      // Try to parse the response as JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        console.error('Failed to parse JSON response:', err);
        throw new Error('Failed to parse JSON response');
      }
  
      console.log("Move response data:", data);
      // Update the dropEvent state to trigger useEffect
      setDropEvent(prev => prev + 1);
    } catch (err) {
      console.error("Error moving item: ", err);
      setError(err.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={`${styles.suggestedContainer} ${styles[theme]}`}>
      {/* Display Folders */}
      {folders.length === 0 ? (
        <p>No folders found</p>
      ) : (
        <ul className={`${styles.fileList} ${styles[theme]}`}>
          {folders.map((folder) => (
            <DraggableFolder
              key={folder.ID}
              folder={folder}
              onClick={() => navigate(`/home/folders/${folder.ID}`)}
              onDrop={handleDrop}
            />
          ))}
        </ul>
      )}
      {/* Display Files */}
      {files.length === 0 ? (
        <p>No files found</p>
      ) : (
        <ul className={`${styles.fileList} ${styles[theme]}`}>
          {files.map((file) => (
            <DraggableFile
              key={file.ID}
              file={file}
              onClick={() => {
                setSelectedFileId(file.ID);
                navigate(`/document/${file.ID}`);
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}