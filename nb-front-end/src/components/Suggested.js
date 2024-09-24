import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from '../styles/Suggested.module.css';
import { FaFileAlt, FaFolder } from 'react-icons/fa';

const ItemTypes = {
  FOLDER: 'folder',
  FILE: 'file',
};

function DraggableFolder({ folder, onClick, onDrop }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOLDER,
    item: { id: folder.ID, type: 'folder' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.FOLDER, ItemTypes.FILE],
    drop: (item) => onDrop(item, folder),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  return (
    <li
      ref={(node) => drag(drop(node))}
      key={folder.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''} ${isOver ? styles.over : ''}`}
      onClick={onClick}
    >
      <FaFolder className={styles.icon} />
      {folder.FolderName}
    </li>
  );
}

function DraggableFile({ file, onClick }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FILE,
    item: { id: file.ID, type: 'file' }, // Add type here
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <li
      ref={drag}
      key={file.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''}`}
      onClick={onClick}
    >
      <FaFileAlt className={styles.icon} />
      {file.FileName}
    </li>
  );
}

export default function Suggested() {
  const { folderID } = useParams(); // Get folderID from URL
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [error, setError] = useState("");
  const [selectedFileId, setSelectedFileId] = useState(null);
  const navigate = useNavigate();
  const [dropEvent, setDropEvent] = useState(0); // State to track drop events

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
  }, [folderID, dropEvent]);

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
        itemType: item.type, // Add itemType here
      });
      console.log('Request Body:', requestBody); // Log request body
  
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
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* Display Folders */}
        {folders.length === 0 ? (
          <p>No folders found</p>
        ) : (
          <ul className={styles.fileList}>
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
          <ul className={styles.fileList}>
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
    </DndProvider>
  );
}