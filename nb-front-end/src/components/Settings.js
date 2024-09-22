import React, { useState, useEffect, useContext} from 'react';
import { FaCog } from 'react-icons/fa';
import styles from '../styles/Settings.module.css';
import parentStyles from '../styles/Home.module.css';
import { UserContext } from '../UserContext';

export default function Settings() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {userID} = useContext(UserContext);
  const [settings, setSettings] = useState("");

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
            {userID ? (
              <div>
                <p><strong>Theme:</strong> {settings.theme}</p>
              </div>
            ) : (
              <p>Loading settings...</p>
            )}
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
