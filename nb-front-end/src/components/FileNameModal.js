import React, { useState, forwardRef, useImperativeHandle, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../styles/Account.module.css';
import { UserContext } from "../UserContext";

const FileNameModal = forwardRef(({triggerRefresh}, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const navigate = useNavigate(); // Get the navigate function
  const {userID} = useContext(UserContext);

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
    try {
      const token = localStorage.getItem('authToken'); // Ensure the token is correctly retrieved
      if (!token) {
        throw new Error('No token found');
      }

      const response = await fetch('http://localhost:8080/protected/create-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`,
        },
        body: JSON.stringify({
          userID: userID,  
          fileName,        
        }),
      });
      
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error('Error response from server:', errorResponse);
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('File created successfully:', data);
      
      // Retrieve the file_id from the response
      const fileId = data.file_id;
      console.log('File ID:', fileId);
      
      // Navigate to the new document route
      navigate(`/document/${fileId}`);
      triggerRefresh();
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