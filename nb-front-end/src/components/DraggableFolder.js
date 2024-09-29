import React from "react";
import { ItemTypes } from "./Suggested";
import { useDrag, useDrop } from 'react-dnd';
import styles from '../styles/Suggested.module.css';
import { FaFolder } from 'react-icons/fa';

export default function DraggableFolder({ folder, onClick, onDrop }) {
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