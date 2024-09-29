import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from "../styles/MenuBar.module.css"

// MenuBar Component
const MenuBar = ({ onMenuAction }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuItemClick = (action) => {
    onMenuAction(action);
    setActiveMenu(null);
  };

// File dropdown
// New - option to create a new file
// Open - opens modal to suggested type view & option
// Rename - option to rename file
// Move - opens modal will all folders and gives option to select one and move it there
// Delete - moves current document to trash
// Print - opens said browsers print window

// Edit dropdown


  return (
    <div className={styles.menuWrapper}>
      <div  onClick={() => handleMenuClick('File')}>File
        {activeMenu === 'File' && (
          <div className={styles.dropdown}>
            <div onClick={() => handleMenuItemClick('New')}>New</div>
            <div onClick={() => handleMenuItemClick('Save')}>Save</div>
            <div onClick={() => handleMenuItemClick('Download')}>Download</div>
          </div>
        )}
      </div>
      <div  onClick={() => handleMenuClick('Edit')}>Edit
        {activeMenu === 'Edit' && (
          <div className={styles.dropdown}>
            <div onClick={() => handleMenuItemClick('Undo')}>Undo</div>
            <div onClick={() => handleMenuItemClick('Redo')}>Redo</div>
            <div onClick={() => handleMenuItemClick('Cut')}>Cut</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuBar;