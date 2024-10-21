import React, {useContext} from 'react'
import { FaSearch } from 'react-icons/fa';
import styles from '../styles/Search.module.css';
import parentStyles from '../styles/Home.module.css';
import { ThemeContext } from '../ThemeContext';

export default function Search() {
  const { theme } = useContext(ThemeContext);

  return (
    <div className={`${parentStyles.search} ${theme === 'dark' ? 'dark' : ''}`}>
      <div className={styles.searchBarWrapper}>
        <FaSearch className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search in Bungo"
        />
      </div>
    </div>
  )
}
