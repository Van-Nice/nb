import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaFolder, FaFile } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Search.module.css";
import parentStyles from "../styles/Home.module.css";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null);
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchTerm) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        `${apiUrl}/api/protected/search?query=${searchTerm}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log(data);

      // Sort results: folders first, then files
      const sortedResults = data.sort((a, b) => {
        if (a.type === "folder" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "folder") return 1;
        return 0;
      });

      setResults(sortedResults);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleResultClick = (result) => {
    // Implement the logic for clicking on a result, e.g., navigating to the file/folder
    if (result.file_name) {
      // Navigate to /document/document_id
      setIsDropdownOpen(false);
      const fileID = result._id;
      navigate(`/document/${fileID}`);
    } else if (result.folder_name) {
      // Navigate to /home/folder_id
      setIsDropdownOpen(false);
      const folderID = result._id;
      navigate(`folders/${folderID}`);
    }
    // console.log(`Clicked on: ${result.file_name || result.folder_name}`);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={parentStyles.search} ref={searchContainerRef}>
      <div className={styles.searchBarWrapper}>
        <FaSearch className={styles.searchIcon} onClick={handleSearch} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search in Bungo"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown} 
          onFocus={() => setIsDropdownOpen(true)}
        />
        {isDropdownOpen && results.length > 0 && (
          <div className={styles.dropdownMenu}>
            {results.map((result) => (
              <div
                key={result._id}
                className={styles.dropdownItem}
                onClick={() => handleResultClick(result)}
              >
                {result.type === "folder" ? (
                  <FaFolder className={styles.icon} />
                ) : (
                  <FaFile className={styles.icon} />
                )}
                <span className={styles.itemText}>
                  {result.folder_name || result.file_name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
