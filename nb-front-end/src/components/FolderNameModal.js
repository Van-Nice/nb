import React, {useState, forwardRef, useImperativeHandle, useContext} from "react";
import styles from '../styles/Account.module.css';
import { UserContext } from "../UserContext";

const FolderNameModal = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const {userID} = useContext(UserContext);

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsModalOpen(true);
    }
  }));

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Folder Submitted:", folderName);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:8080/protected/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({
          userID: userID,
          folderName,
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Folder created successfully:', data)

      // Navigate to new folder route but stay inside home component
    } catch (error) {
      console.error('Error creating file:', error);
    }
    closeModal()
  }

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>File Name</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Enter folder name:
                <input
                  type="text"
                  value={folderName}
                  onChange={handleFolderNameChange}
                  required
                />
              </label>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
});

export default FolderNameModal;
