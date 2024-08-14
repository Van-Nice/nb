import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/CreateAccount.module.css";

// TODO: Validate user input before submitting

export default function CreateAccount() {
  // Name
  const validateName = (name) => {
    const minLength = name.length > 1;
    const isAlphabetic = /^[A-Za-z]+$/.test(name);
    return {
      minLength,
      isAlphabetic,
    };
  };
  // First Name
  const [firstName, setFirstName] = useState("");
  const [firstNameIsTyping, setFirstNameIsTyping] = useState(false);
  const [firstNameValid, setFirstNameValid] = useState({
    minLength: false,
    isAlphabetic: true,
  });
  const handleFirstName = (e) => {
    setFirstNameIsTyping(true);
    const value = e.target.value;
    setFirstName(value);
    setFirstNameValid(validateName(value));
  };
  // Last name
  const [lastName, setLastName] = useState("");
  const [lastNameValid, setLastNameValid] = useState(false);
  const [lastNameIsTyping, setLastNameIsTyping] = useState({
    minLength: false,
    isAlphabetic: true,
  });
  const handleLastName = (e) => {
    setLastNameIsTyping(true);
    const value = e.target.value;
    setLastName(value);
    setLastNameValid(validateName(value));
  }
  // Username - set after you already have your db configured
  const [username, setUserName] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);
  const [usernameIsTyping, setUsernameIsTypeing] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  // Input validation

  const [emailValid, setEmailValid] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [birthDateError, setBirthDateError] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const navigate = useNavigate();

// Validation functions

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [isFormValid, setIsFormValid] = useState(false);

  const validatePassword = (password) => {
    const minLength = 8
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
  };

  return (
    <>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        {/* form flex-box */}
        <div className={styles.container}>
          {/* Name section */}
          <div className={styles.name}>
            {/* First name */}
            <div className={styles.section}>
              <label>
                First:
                <input
                  type="text"
                  onChange={handleFirstName}
                  maxLength={50}
                />
              </label>
              <div className={styles.error}>
               {firstNameIsTyping && !firstNameValid.minLength && (
                <div>2 character minimum</div>
               )}
               {firstNameIsTyping && !firstNameValid.isAlphabetic && (
                <div>Only alphabetic characters allowed</div>
               )}
              </div>
            </div>
            {/* Last name */}
            <div>
              <label>
                Last:
                <input
                  type="text"
                  onChange={handleLastName}
                />
              </label>
              <div className={styles.error}>
                {lastNameIsTyping && !lastNameValid.minLength && (
                  <div>2 character minimum</div>
                )}
                {lastNameIsTyping && !lastNameValid.isAlphabetic && (
                  <div>Only alphabetic characters allowed</div>
                )}
              </div>
            </div>
          </div>
          {/* Email */}
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}

            />
          <div className={styles.error}>
            {/* {email.length > 0 && !emailRegex.test(email) ? "Invalid email" : ""} */}
          </div>
          </label>
          {/* Username */}
          <label>
            Username:
            <input
              type="text"
              name="username"
              value={username}
              onChange={(e) => setUserName(e.target.value)}
              maxLength={24}
            />
            <div className={styles.error}>
              {username.length < 6 && username.length > 0
                ? "6 character minimum"
                : ""}
            </div>
          </label>
          {/* Password */}
          <label>
            <input 
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {/* Submit Button */}
          <button type="submit" className={styles.createAccountButton}>
            Create Account
          </button>
        </div>
      </form>
    </>
  );
}
