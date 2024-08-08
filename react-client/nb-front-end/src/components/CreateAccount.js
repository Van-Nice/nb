'use client';
import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './CreateAccount.module.css';

export default function CreateAccount() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isValidBirthDate = (date) => {
    const today = new Date();
    const birthDate = new Date(date);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 13;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    // Basic validation
    if (email === '') {
      setError('Email is required');
      return;
    }

    if (password === '') {
      setError('Password is required');
      return;
    }

    if (!isValidBirthDate(birthDate)) {
      setError('You must be at least 13 years old');
      return;
    }

    try {
      // TODO: send create account form to php server
      const reponse = await fetch('http://localhost:8000/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({firstName, lastName, email, password, birthDate}),
      });

      if (!reponse.ok) {
        throw new Error('Failed to create account');
      }

      const data = await reponse.json();
      console.log('Account created with ID: ', data.userId);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    // TODO: add first/last name and date of birth form input sections
    <div>
      <h1>Create Account</h1>
      <form onSubmit={handleSubmit}>
        <div className={styles.container}>
          <div className={styles.name}>
            <label>
              First:
              <input type='text' name='firstName' value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
            </label>
            <label>
              Last:
              <input type='text' name='lastName' value={lastName} onChange={(e) => setLastName(e.target.value)}/>
            </label>
          </div>
          <label>
            Email:
            <input type="text" name="email" value={email} onChange={(e) => setEmail((e.target.value))}/>
          </label>
          <label>
            Password:
            <input type="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </label>
          <label>
            Date of Birth:
            <input type="date" name="birthDate" value={birthDate} onChange={(e) => setBirthDate(e.target.value)}/>
          </label>
          <button className={styles.createAccountButton} type="submit">Create Account</button>
        </div>
      </form>
      {error && <p>{error}</p>}
      <Link to="/login" className={styles.link}>Login</Link>
    </div>
  );
}
