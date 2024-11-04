import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import User from '../models/User';
import {UserContext} from "../UserContext.js";
import { config } from '../config/config.js';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const {setUserID} = useContext(UserContext)

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
        console.log("Attempting login with:", { email, password });
        const response = await fetch(`${config.apiUrl}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
        });
        
        console.log("Response status:", response.status);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Login error:", errorData);
            setError(errorData.message || "Invalid login credentials");
            return;
        }

        const data = await response.json();
        console.log("Login successful:", data);
        const user = new User(data.id, data.name, data.email, data.token, data.settings);
        setUserID(data.id);
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userID", data.id)
        navigate("/home", {state: {user}});
    } catch (error) {
        console.error("Login error:", error);
        setError(error.message || "An error occurred during login");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={email}
            onChange={handleEmail}
          />
        </label>
        <label>
          Password:
          <div className={styles.passwordInput}>
            <input
              className={styles.passwordInput}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePassword}
            />
            <span className={styles.toggleIcon} onClick={toggleShowPassword}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </label>
        {error && <div className={styles.error}>Invalid credentials</div>}
        <button type="submit">Login</button>
      </form>
      <Link to="/create-account">Create Account</Link>
    </div>
  );
}
