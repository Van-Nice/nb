import React, { useState } from 'react';
import { FaCog } from 'react-icons/fa'; // Importing the gear icon from Font Awesome
import styles from '../styles/Settings.module.css';
import parentStyles from '../styles/Home.module.css';

export default function Settings({user}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={parentStyles.settings}>
      <div className={styles.iconWrapper} onClick={openModal}>
        <FaCog className={styles.icon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Settings</h2>
            <p>Here is where the settings details will be shown.</p>
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
