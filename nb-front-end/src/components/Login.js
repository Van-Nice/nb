import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Login.module.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import User from '../models/User';
import {UserContext} from "../UserContext.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const {setUserID} = useContext(UserContext)
  const apiUrl = process.env.REACT_APP_API_URL;

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

    if (email === "") {
      setError("Email is required");
      return;
    }

    if (password === "") {
      setError("Password is required");
      return;
    }

    const login = {
      email,
      password,
    };

    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      if (!response.ok) {
        setError(true);
        throw new Error("Invalid login credentials");
      }

      const data = await response.json();
      const user = new User(data.id, data.name, data.email, data.token, data.settings);
      setUserID(data.id);
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("userID", data.id)
      navigate("/home", {state: {user}});
    } catch (error) {
      setError(error.message);
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
