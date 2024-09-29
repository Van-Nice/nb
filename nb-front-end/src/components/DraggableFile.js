import React from "react";
import { ItemTypes } from "./Suggested";
import { useDrag } from 'react-dnd';
import styles from '../styles/Suggested.module.css';
import { FaFileAlt } from 'react-icons/fa';


export default function DraggableFile({ file, onClick }) {
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