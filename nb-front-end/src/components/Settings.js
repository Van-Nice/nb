import React from 'react'
import { FaCog } from 'react-icons/fa'; // Importing the gear icon from Font Awesome
import styles from '../styles/Settings.module.css';
import parentStyles from '../styles/Home.module.css';

export default function Settings() {
  return (
    <div className={parentStyles.settings}>
      <div className={styles.iconWrapper}>
        <FaCog className={styles.icon} />
      </div>
    </div>
  )
}
