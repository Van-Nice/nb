import React, {useState, forwardRef, useImperativeHandle} from "react";
import styles from '../styles/Account.module.css';
import { UserContext } from "../UserContext";

const FolderNameModal = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const {userID} = UserContext(UserContext);

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
    console.log("Folder Submitted:", folderName);
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
