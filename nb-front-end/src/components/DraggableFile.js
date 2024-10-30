import React from "react";
import { ItemTypes } from "./Suggested";
import { useDrag } from 'react-dnd';
import styles from '../styles/Suggested.module.css';
import { FaFileAlt } from 'react-icons/fa';

// DraggableFile component represents a draggable file item
export default function DraggableFile({ file, onClick, isTrashView }) {
  // Set up drag functionality using react-dnd
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.FILE,
    item: { id: file.ID, type: 'file' }, // Specify the dragged item
    collect: (monitor) => ({
      isDragging: monitor.isDragging(), // Track if the item is being dragged
    }),
    canDrag: !isTrashView, // Disable dragging in trash view
  }));

  // Render the file item
  return (
    <li
      ref={drag} // Attach the drag ref
      key={file.ID}
      className={`${styles.fileItem} ${isDragging ? styles.dragging : ''}`} // Apply dragging style when being dragged
      onClick={onClick} // Handle click event
    >
      <FaFileAlt className={styles.icon} /> {/* Display file icon */}
      {file.FileName} {/* Display file name */}
    </li>
  );
}