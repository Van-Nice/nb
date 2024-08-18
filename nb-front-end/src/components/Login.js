import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (email === '') {
      setError('Email is required');
      return;
    }

    if (password === '') {
      setError('Password is required');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, password}),
      });

      if (!response.ok) {
        throw new Error('Invalid login credentials');
      }

      const data = await response.json();
      console.log(data.userId, 'user logged in');
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className={styles.container}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input type="text" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Login</button>
      </form>
      <Link to="/create-account">Create Account</Link>
    </div>
  );
}