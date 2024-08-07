'use client';
import React from 'react';
import { Link } from 'react-router-dom';

// TODO have a link to the login page

export default function CreateAccount() {
  return (
    <div>
      <h1>Create Account</h1>
      <form>
        <label>
          Email:
          <input type="text" name="email" />
        </label>
        <label>
          Password:
          <input type="password" name="password" />
        </label>
        <button type="submit">Create Account</button>
      </form>
      <Link to="/login">Login</Link>
    </div>
  );
}
