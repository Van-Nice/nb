import React from 'react'
import { FaSearch } from 'react-icons/fa'; // Optional: Using Font Awesome for the search icon
import styles from '../styles/Search.module.css';
import parentStyles from '../styles/Home.module.css';

export default function Search() {
  return (
    <div className={parentStyles.search}>
      <div className={styles.searchBarWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search in Drive"
        />
      </div>
    </div>
  )
}
