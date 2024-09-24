import React, { useState } from 'react';
import { useDrop } from 'react-dnd';
import { FaTrashAlt } from 'react-icons/fa'; // Importing the trash icon from Font Awesome
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Trash.module.css';
import { ItemTypes } from './Suggested';

export default function Trash() {
  const [isSelected, setIsSelected] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setIsSelected(!isSelected);
    navigate('/home/trash'); // Navigate to the trash folder route
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