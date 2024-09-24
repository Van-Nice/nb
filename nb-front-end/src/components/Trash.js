import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { FaTrashAlt } from 'react-icons/fa'; // Importing the trash icon from Font Awesome
import styles from '../styles/Trash.module.css';
import { ItemTypes } from './Suggested';

export default function Trash() {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    setIsSelected(!isSelected);
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.FILE, ItemTypes.FOLDER],
    drop: (item) => handleDrop(item),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const handleDrop = async (item) => {
    console.log(`Dropped item ${item.id} into trash`);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      // Check if the user has a trash folder
      const checkResponse = await fetch('http://localhost:8080/protected/check-trash-folder', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
      });

      if (!checkResponse.ok) {
        throw new Error('Failed to check trash folder');
      }

      const checkData = await checkResponse.json();
      let trashFolderID = checkData.trashFolderID;

      // If the user doesn't have a trash folder, create one
      if (!trashFolderID) {
        const createResponse = await fetch('http://localhost:8080/protected/create-trash-folder', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `${token}`,
          },
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create trash folder');
        }

        const createData = await createResponse.json();
        trashFolderID = createData.trashFolderID;
      }

      // Move the item to the trash folder
      const requestBody = JSON.stringify({
        itemID: item.id,
        targetFolderID: trashFolderID,
        itemType: item.type,
      });

      const moveResponse = await fetch('http://localhost:8080/protected/move-item', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: requestBody,
      });

      if (!moveResponse.ok) {
        throw new Error('Failed to move item to trash folder');
      }

      const moveData = await moveResponse.json();
      console.log("Move response data:", moveData);
    } catch (err) {
      console.error("Error moving item: ", err);
    }
  };

  return (
    <div
      ref={drop}
      className={`${styles.container} ${isSelected ? styles.selected : styles.unselected} ${isOver ? styles.over : ''}`}
      onClick={handleClick}
    >
      <FaTrashAlt className={styles.icon} />
      <span className={styles.label}>Trash</span>
    </div>
  );
}