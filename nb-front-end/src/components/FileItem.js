import React from 'react';
import styles from '../styles/FileItem.module.css';
import { FaFileAlt } from 'react-icons/fa';

export default function FileItem({file, onClick}) {
  return (
    <div className={styles.fileItem} onClick={onClick}>
      <FaFileAlt className={styles.fileIcon} />
      <span>{file.FileName}</span>
    </div>
  );
}