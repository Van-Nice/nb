import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { useDrag, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import styles from '../styles/Suggested.module.css';
import { FaFileAlt, FaFolder } from 'react-icons/fa';

const ItemTypes = {
  FOLDER: 'folder',
  FILE: 'file',
};

function DraggableFolder({ folder, onClick }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOLDER,
    item: { id: folder.ID },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <li
      ref={drag}
      key={folder.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''}`}
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
    item: { id: file.ID },
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