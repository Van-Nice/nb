import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useContext,
} from "react";
import styles from "../styles/Account.module.css";
import { UserContext } from "../UserContext";

const FolderNameModal = forwardRef(({ triggerRefresh }, ref) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const { userID } = useContext(UserContext);

  useImperativeHandle(ref, () => ({
    openModal() {
      setIsModalOpen(true);
    },
  }));

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFolderNameChange = (e) => {
    setFolderName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Logging values before payload to ensure they're valid
    console.log({
      userID: userID,
      folderName,
    });

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(
        "http://localhost:8080/protected/create-folder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`,
          },
          body: JSON.stringify({
            userID: Number(userID), // Convert userID to a number explicitly
            folderName,
          }),
        }
      );
      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from server:", errorResponse);
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Folder created successfully:", data);
      triggerRefresh();
      // Navigate to new folder route but stay inside home component
    } catch (error) {
      console.error("Error creating file:", error);
    }
    closeModal();
  };

  return (
    <>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
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
  );
});

export default FolderNameModal;
