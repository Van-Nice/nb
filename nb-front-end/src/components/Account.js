import React, { useState } from 'react';
import { FaUser } from 'react-icons/fa'; // Importing the user icon from Font Awesome
import styles from '../styles/Account.module.css';
import parentStyles from '../styles/Home.module.css';

export default function Account() {

  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={parentStyles.account}>
      <div className={styles.iconWrapper} onClick={openModal}>
        <FaUser className={styles.icon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Account Information</h2>
            <p>Here is where the account details will be shown.</p>
            <button className={styles.closeButton} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
