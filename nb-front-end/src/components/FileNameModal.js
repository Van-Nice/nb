import React, {useState} from "react";
import styles from '../styles/Account.module.css';

export default function FileNameModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  const openModal = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hand file name submission logic here
    console.log("File name submitted:", fileName);
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
                Enter file name:
                <input
                  type="text"
                  value={fileName}
                  onChange={handleFileNameChange}
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
}