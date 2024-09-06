import React, { useState, forwardRef, useImperativeHandle } from "react";
import styles from '../styles/Account.module.css';

const FileNameModal = forwardRef((props, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsModalOpen(true);
    }
  }));

  const closeModal = () => {
    setIsModalOpen(false);
  }

  const handleFileNameChange = (e) => {
    setFileName(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("File name submitted:", fileName);
    // Handle file name submission logic here
    // TODO: Make a POST request to /protected/create-file endpoint
    try {
      const response = await fetch('/protected/create-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({fileName}),
      });
      
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('File created successfully:', data)
    } catch (error) {
      console.error('Error creating file:', error);
    }
    closeModal();
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
});

export default FileNameModal;