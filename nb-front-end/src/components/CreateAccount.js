import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import styles from "../styles/CreateAccount.module.css";

export default function CreateAccount() {
  const navigate = useNavigate();

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
  const [usernameIsTyping, setUsernameIsTyping] = useState(false);

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
  const [showPassword, setShowPassword] = useState(false);
  const handlePassword = (e) => {
    setPasswordIsTyping(true);
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(validatePassword(value));
  };
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Confirm password
  const validateConfirmPassword = (confirmPassword, password) => {
    return confirmPassword === password;
  };
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmPasswordIsTyping, setConfirmPasswordIsTyping] = useState(false);
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false);
  const handleConfirmPassword = (e) => {
    setConfirmPasswordIsTyping(true);
    const value = e.target.value;
    setConfirmPassword(value);
    setConfirmPasswordValid(validateConfirmPassword(value, password));
  };

  // Birth date
  const validateDate = (date) => {
    // Regular expression to check if the date is in MM/DD/YYYY format
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
    const format = regex.test(date);
    const formatValid = regex.test(date);
    // Check if above 13 and below 115
    const [year, month, day] = date.split("-");
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
    // Adjust age if the current date is before the
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    console.log(age);
    const tooYoung = age < 13;
    const tooOld = age > 120;

    return {
      formatValid,
      tooYoung,
      tooOld,
    };
  };
  const [birthDate, setBirthDate] = useState("");
  const [birthDateIsTyping, setBirthDateIsTyping] = useState(false);
  const [birthDateValid, setBirthDateValid] = useState({
    formatValid: false,
    tooYoung: false,
    tooOld: false,
  });
  const handleDate = (e) => {
    setBirthDateIsTyping(true);
    const value = e.target.value;
    console.log(value);
    setBirthDate(value);
    setBirthDateValid(validateDate(value));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Set each input as isTyping to see any potential errors
    setFirstNameIsTyping(true);
    setLastNameIsTyping(true);
    setEmailIsTyping(true);
    setUsernameIsTyping(true);
    setPasswordIsTyping(true);
    setConfirmPasswordIsTyping(true);
    setBirthDateIsTyping(true);

    // Validate each input
    const isFirstNameValid = firstNameValid.minLength && firstNameValid.isAlphabetic;
    const isLastNameValid = lastNameValid.minLength && lastNameValid.isAlphabetic;
    const isEmailValid = emailValid;
    const isUsernameValid = username.length >= 6;
    const isPasswordValid = passwordValid.minLength &&
      passwordValid.hasUpperCase &&
      passwordValid.hasLowerCase &&
      passwordValid.hasNumber &&
      passwordValid.hasSpecialChar &&
      passwordValid.noSpaces;
    const isConfirmPasswordValid = confirmPasswordValid;
    const isBirthDateValid = birthDateValid.formatValid && !birthDateValid.tooYoung && !birthDateValid.tooOld;

    // Check if all inputs are valid
    if (isFirstNameValid && isLastNameValid && isEmailValid && isUsernameValid && isPasswordValid && isConfirmPasswordValid && isBirthDateValid) { // Form is valid
      const form = {
        firstName,
        lastName,
        email,
        username,
        password,
        birthDate
      }
      console.log(form);
      // todo: send form to backend /auth/create-account api
      try { // POST request successful
        const response = await fetch('http://localhost:8000/auth/create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
        if (response.ok) { // Create account form data valid
          const responseData = await response.json();
          console.log('Account created successfully: ', responseData);
          navigate('/email-confirmation-instruction'); // Navigate to email confirmation instruction page
        } else { // form data invalid
          const responseError = await response.json();
          console.error('Error creating account:', responseError);
          alert('Error creating account: ' + responseError);
        }

      } catch (error) { // POST request failed
        console.error('Network error:', error);
        alert('Network error' + error.message);
      }
    } else { // Form is invalid
      alert("Form is invalid. Please correct the errors and try again.");
    }
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
            <div className={styles.passwordContainer}>
              <input
                className={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                onChange={handlePassword}
              />
              <span className={styles.toggleIcon} onClick={toggleShowPassword}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
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
            <div className={styles.passwordContainer}>
              <input
                className={styles.passwordInput}
                type={showPassword ? "text" : "password"}
                onChange={handleConfirmPassword}
              />
              <span className={styles.toggleIcon}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </label>
          <div className={styles.errorContainer}>
            {confirmPasswordIsTyping && !confirmPasswordValid && (
              <div className={styles.error}>Passwords do not match</div>
            )}
          </div>
          {/* Date of birth */}
          <label htmlFor="">
            Date of Birth:
            <input type="date" onChange={handleDate} />
          </label>
          <div className={styles.errorContainer}>
            {birthDateIsTyping && !birthDateValid.formatValid && (
              <div className={styles.error}>Invalid Date</div>
            )}
            {birthDateIsTyping && birthDateValid.tooYoung && (
              <div className={styles.error}>Must be 13 or older</div>
            )}
            {birthDateIsTyping && birthDateValid.tooOld && (
              <div className={styles.error}>
                I don't believe your older than 120
              </div>
            )}
          </div>
          {/* Submit Button */}
          <button type="submit" className={styles.createAccountButton}>
            Create Account
          </button>
        </div>
      </form>
      <Link to="/login" className={styles.link}>
        Login
      </Link>
    </>
  );
}
