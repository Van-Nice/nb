import React from "react";
import { ItemTypes } from "./Suggested";
import { useDrag, useDrop } from 'react-dnd';
import styles from '../styles/Suggested.module.css';
import { FaFolder } from 'react-icons/fa';

// DraggableFolder component represents a draggable and droppable folder item
export default function DraggableFolder({ folder, onClick, onDrop, isTrashView }) {
  // Set up drag functionality
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FOLDER,
    item: { id: folder.ID, type: 'folder' },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  // Set up drop functionality
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.FOLDER, ItemTypes.FILE],
    drop: (item) => !isTrashView && onDrop(item, folder),
    collect: (monitor) => ({
      isOver: !isTrashView && monitor.isOver(),
    }),
  }));

  // Render the folder item
  return (
    <li
      ref={(node) => drag(isTrashView ? node : drop(node))} // Combine drag and drop refs
      key={folder.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''} ${isOver ? styles.over : ''}`}
      onClick={onClick}
    >
      <FaFolder className={styles.icon} /> {/* Display folder icon */}
      {folder.FolderName} {/* Display folder name */}
    </li>
  );
}
