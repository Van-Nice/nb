import React, { useState, useContext, useEffect } from "react";
import { FaUser } from "react-icons/fa"; // Importing the user icon from Font Awesome
import styles from "../styles/Account.module.css";
import parentStyles from "../styles/Home.module.css";
import { UserContext } from "../UserContext";
import LogoutButton from "./LogoutButton";

export default function Account() {
  const { userID } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleGetUserAccount = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No token found");
        }

        const response = await fetch(
          "https://api.bungo.rocks/protected/account-data",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `${token}`,
            },
            body: JSON.stringify({
              userID: userID,
            }),
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setUser(data.accountData);
      } catch (error) {
        console.error("Error fetching user account:", error);
        setError(error.message);
      }
    };
    handleGetUserAccount();
  }, [userID]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={parentStyles.account}>
      <div className={styles.iconWrapper} onClick={openModal}>
        <FaUser className={styles.icon} />
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Account Information</h2>
            <p>
              <strong>Name:</strong> {user.first_name + " " + user.last_name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <div className={styles.column}>
              <LogoutButton />
              <button className={styles.closeButton} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
