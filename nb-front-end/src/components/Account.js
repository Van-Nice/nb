import React from 'react'
import { FaUser } from 'react-icons/fa'; // Importing the user icon from Font Awesome
import styles from '../styles/Account.module.css';
import parentStyles from '../styles/Home.module.css';

export default function Account() {
  return (
    <div className={parentStyles.account}>
      <div className={styles.iconWrapper}>
        <FaUser className={styles.icon} />
      </div>
    </div>
  )
}
