import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../UserContext";
import { logout } from "../utils/auth";
import styles from "../styles/LogoutButton.module.css";

const LogoutButton = () => {
  const { setUserID } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear the user ID from context and localStorage
    setUserID(null);
    logout();

    // Navigate to the login page
    navigate("/login");
  };

  return (
    <button onClick={handleLogout} className={styles.logoutButton}>
      Logout
    </button>
  );
};

export default LogoutButton;
