import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EmailConfirmation() {
  const [confirmationStatus, setConfirmationStatus] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const confirmEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      console.log(token);

      if (!token) {
        setError('Invalid token');
        setConfirmationStatus('error');
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/email-confirmation?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to confirm email');
        }
        const data = await response.json();
        console.log(data, data.email_validated, data.status);
        if (data.email_validated) {
          setConfirmationStatus(data.email_validated);
        }
      } catch (error) {
        setError(error.message);
        setConfirmationStatus('error');
      }
    };

    confirmEmail();
  }, []);

  return (
    <div>
      {confirmationStatus ? (
        <>
          <h1>Your email has been confirmed!</h1>
          <Link to="/login">Go to Login</Link>
        </>
      ) : (
        <>
          <h1>Failed to confirm email</h1>
          <p>{error}</p>
        </>
      )}
    </div>
  );
}