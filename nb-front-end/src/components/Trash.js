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
      const response = await fetch("http://localhost:8080/protected/delete-item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `${token}`,
        },
        body: JSON.stringify({
          itemID: item.id,
          itemType: item.type,
        })
      });
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log("fetched data from trash drop:", data)
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