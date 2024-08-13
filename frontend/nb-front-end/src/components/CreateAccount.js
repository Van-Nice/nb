import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/CreateAccount.module.css";

export default function CreateAccount() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();

  const isValidBirthDate = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age >= 13;
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidation({
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
    });

    if (password.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    if (!hasUpperCase) {
      return "Password must contain at least one uppercase letter";
    }
    if (!hasLowerCase) {
      return "Password must contain at least one lowercase letter";
    }
    if (!hasNumber) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setIsTypingPassword(true);
    validatePassword(newPassword);
  };


  const handleConfirmPasswordChange = (e) => {
    const confirmPasswordValue = e.target.value;
    setConfirmPassword(confirmPasswordValue);
    if (confirmPasswordValue !== password) {
      setConfirmPasswordError("Passwords do not match");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setPasswordError("");

    if (email === "") {
      setError("Email is required");
      return;
    }

    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      setPasswordError(passwordValidationError);
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      setError("You must be at least 13 years old");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          birthDate,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create account");
      } else {
        console.log("Account created!");
        navigate("/login");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.name}>
            <label>
              First:
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </label>
            <label>
              Last:
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </label>
          </div>
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
            />
          </label>
          <label>
            Email:
            <input
              type="text"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <div>
            <label>
              Password:
              <input
                type="password"
                name="password"
                value={password}
                onChange={handlePasswordChange}
              />
            </label>
            {passwordError && <p className={styles.error}>{passwordError}</p>}
            {isTypingPassword && (
              <ul className={styles.passwordRequirements}>
                <li>
                  <input
                    type="checkbox"
                    checked={passwordValidation.minLength}
                    readOnly
                  />
                  8 characters long
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={passwordValidation.hasUpperCase}
                    readOnly
                  />
                  At least one uppercase letter
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={passwordValidation.hasLowerCase}
                    readOnly
                  />
                  At least one lowercase letter
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={passwordValidation.hasNumber}
                    readOnly
                  />
                  At least one number
                </li>
                <li>
                  <input
                    type="checkbox"
                    checked={passwordValidation.hasSpecialChar}
                    readOnly
                  />
                  At least one special character
                </li>
              </ul>
            )}
          </div>
          <div>
            <label>
              Confirm Password:
              <input
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
              />
            </label>
            {confirmPasswordError && (
              <p className={styles.error}>{confirmPasswordError}</p>
            )}
          </div>
          <label>
            Date of Birth:
            <input
              type="date"
              name="birthDate"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />
          </label>
          <button className={styles.createAccountButton} type="submit">
            Create Account
          </button>
        </div>
      </form>
      {error && <p className={styles.error}>{error}</p>}
      <Link to="/login" className={styles.link}>
        Login
      </Link>
    </div>
  );
}