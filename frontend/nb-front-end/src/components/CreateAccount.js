import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/CreateAccount.module.css";

// TODO: Validate user input before submitting

export default function CreateAccount() {
  // Name
  const validateName = (name) => {
    const minLength = name.length > 1;
    const isAlphabetic = /^[A-Za-z\s]+$/.test(name);
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
  const [lastNameIsTyping, setLastNameIsTyping] = useState(false); // should be a boolean
  const [lastNameValid, setLastNameValid] = useState({
    minLength: false,
    isAlphabetic: true,
  });
  const handleLastName = (e) => {
    setLastNameIsTyping(true);
    const value = e.target.value;
    setLastName(value);
    setLastNameValid(validateName(value));
  };

  // Email
  // todo: Validate by checking if there's already an account with this email if so prompt user to login
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const [email, setEmail] = useState("");
  const [emailIsTyping, setEmailIsTyping] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const handleEmail = (e) => {
    setEmailIsTyping(true);
    const value = e.target.value;
    setEmail(value);
    setEmailValid(validateEmail(value));
  };

  // Username
  // TODO: Validate by checking with the database to make sure there's no other user with the same name
  const [username, setUserName] = useState("");
  const [usernameValid, setUsernameValid] = useState(false);
  const [usernameIsTyping, setUsernameIsTypeing] = useState(false);

  // Password
  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const noSpaces = /^[^\s]+$/.test(password);

    return {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar,
      noSpaces,
    };
  };
  const [password, setPassword] = useState("");
  const [passwordIsTyping, setPasswordIsTyping] = useState(false);
  const [passwordValid, setPasswordValid] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    noSpaces: true,
  });
  const handlePassword = (e) => {
    setPasswordIsTyping(true);
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(validatePassword(value));
  };

  // Confirm password
  const [confirmPassword, setConfirmPassword] = useState("");
  // Birth date
  const [birthDate, setBirthDate] = useState("");
  // Input validation

  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const [birthDateError, setBirthDateError] = useState(false);
  const navigate = useNavigate();

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
                <input type="text" onChange={handleFirstName} maxLength={50} />
              </label>
              <div className={styles.errorContainer}>
                {firstNameIsTyping && !firstNameValid.minLength && (
                  <div className={styles.error}>2 character minimum</div>
                )}
                {firstNameIsTyping && !firstNameValid.isAlphabetic && (
                  <div className={styles.error}>
                    Only alphabetic characters allowed
                  </div>
                )}
              </div>
            </div>
            {/* Last name */}
            <div className={styles.section}>
              <label>
                Last:
                <input type="text" onChange={handleLastName} maxLength={50} />
              </label>
              <div className={styles.errorContainer}>
                {lastNameIsTyping && !lastNameValid.minLength && (
                  <div className={styles.error}>2 character minimum</div>
                )}
                {lastNameIsTyping && !lastNameValid.isAlphabetic && (
                  <div className={styles.error}>
                    Only alphabetic characters allowed
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Email */}
          <label>
            Email:
            <input type="email" onChange={handleEmail} maxLength={255} />
            <div className={styles.errorContainer}>
              {emailIsTyping && !emailValid && (
                <div className={styles.error}>Invalid Email</div>
              )}
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
            Password:
            <input type="password" onChange={handlePassword} />
          </label>
          <div className={styles.errorContainer}>
            {passwordIsTyping && !passwordValid.minLength && (
              <div className={styles.error}>Need at least 8 characters</div>
            )}
            {passwordIsTyping && !passwordValid.hasUpperCase && (
              <div className={styles.error}>
                Need at least 1 uppercase character
              </div>
            )}
            {passwordIsTyping && !passwordValid.hasLowerCase && (
              <div className={styles.error}>
                Need at least 1 lowercase character
              </div>
            )}
            {passwordIsTyping && !passwordValid.hasNumber && (
              <div className={styles.error}>Need at least 1 number</div>
            )}
            {passwordIsTyping && !passwordValid.hasSpecialChar && (
              <div className={styles.error}>
                Need at least 1 special character ex. $,#,@,*
              </div>
            )}
            {passwordIsTyping && !passwordValid.noSpaces && (
              <div className={styles.error}>
                Password cannot contain spaces!
              </div>
            )}
          </div>
          {/* Confirm Password */}
          <label>
            Confirm Password:
            <input
              type="password"
              // onChange={}
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
