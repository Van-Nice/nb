'use client';
import React from 'react';
import { Link } from 'react-router-dom';
// TODO have a link to the create account page

export default function Login() {
  return (
    <div>
      <h1>Login</h1>
      <form>
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