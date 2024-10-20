import React from 'react';
import styles from '../styles/FolderItem.module.css';
import { FaFolder } from 'react-icons/fa';

export default function FolderItem({folder, onClick}) {
  return (
    <div className={styles.folderItem} onClick={onClick}>
      <FaFolder className={styles.folderIcon} />
      <span>{folder.FolderName}</span>
    </div>
  );
}