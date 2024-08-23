import React, { useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa'; // Importing the trash icon from Font Awesome
import styles from '../styles/Trash.module.css';

export default function Trash() {
    const [isSelected, setIsSelected] = useState(false);

    const handleClick = () => {
      setIsSelected(!isSelected);
    };

  return (
    <div
      className={`${styles.container} ${isSelected ? styles.selected : styles.unselected}`}
      onClick={handleClick}
    >
      <FaTrashAlt className={styles.icon} />
      <span className={styles.label}>Trash</span>
    </div>
  )
}
