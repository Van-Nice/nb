import React, { useState, forwardRef, useImperativeHandle } from "react";
import styles from '../styles/RenameFileModal.module.css';

const RenameFileModal = forwardRef(({ currentFileName, onRename }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState(currentFileName || "");

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsModalOpen(true);
      setNewFileName(currentFileName || "");
    },
  }));

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFileNameChange = (e) => {
    setNewFileName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("New file name submitted:", newFileName);
    await onRename(newFileName); // Call the onRename prop
    closeModal();
  };

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>Rename File</h2>
            <form onSubmit={handleSubmit}>
              <label>
                Enter new file name:
                <input
                  type="text"
                  value={newFileName}
                  onChange={handleFileNameChange}
                  required
                />
              </label>
              <div className={styles.buttonGroup}>
                <button type="submit">Rename</button>
                <button type="button" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
});

export default RenameFileModal;
