import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/CreateAccount.module.css";

export default function CreateAccount() {
  // Values
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  // Errors
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [usernameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [birthDateError, setBirthDateError] = useState("");
  // Other
  const [isTypingPassword, setIsTypingPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <h1>Create Account</h1>
      <form>
        
      </form>
    </>
  )
}