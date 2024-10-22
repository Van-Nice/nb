import React from "react";
import { ItemTypes } from "./Suggested";
import { useDrag, useDrop } from 'react-dnd';
import styles from '../styles/Suggested.module.css';
import { FaFolder } from 'react-icons/fa';

export default function DraggableFolder({ folder, onClick, onDrop, isTrashView }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOLDER,
    item: { id: folder.ID, type: 'folder' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.FOLDER, ItemTypes.FILE],
    drop: (item) => !isTrashView && onDrop(item, folder),
    collect: (monitor) => ({
      isOver: !isTrashView && monitor.isOver(),
    }),
  }));

  return (
    <li
      ref={(node) => drag(isTrashView ? node : drop(node))}
      key={folder.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''} ${isOver ? styles.over : ''}`}
      onClick={onClick}
    >
      <FaFolder className={styles.icon} />
      {folder.FolderName}
    </li>
  );
}
