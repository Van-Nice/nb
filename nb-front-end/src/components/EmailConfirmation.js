import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function EmailConfirmation() {
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        const response = await fetch(`http://localhost:8080/email-confirmation?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to confirm email');
        }
        const data = await response.json();
        if (data.email_validated) {
          setConfirmationStatus('success');
        } else {
          setConfirmationStatus('error');
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
      {confirmationStatus === 'success' ? (
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