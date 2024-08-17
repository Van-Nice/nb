import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
export default function EmailConfirmation() {
  const [confirmationStatus, setConfirmationStatus] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const response = await fetch('http://localhost:8000/email-confirmation', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to confirm email');
        }
        const data = await response.json();
        setConfirmationStatus(data.status);
      } catch (error) {
        setError(error.message);
        setConfirmationStatus('error');
      }
    };

    confirmEmail();
  }, []);

 const handleResendConfirmation = async (token) => {
   try {
     const response = await fetch('http://localhost:8000/resend-confirmation', {
       method: 'POST',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({token}),
     });

     if (!response.ok) {
       throw new Error('Failed to resend confirmation email');
     }

     alert('Confirmation email resent!');
   } catch (error) {
     setError(error.message);
   }
 };

  return (
    <div>
      {confirmationStatus === 'success' ? (
        <>
          <h1>Your email has been confirmed!</h1>
          <Link to="/login">Go to Login</Link>
        </>
      ) : (
        <>
          <h1>Link valid for 24hrs failed to confirm email</h1>
          <p>{error}</p>
          <button onClick={handleResendConfirmation}>Resend Confirmation Email</button>
        </>
      )}
    </div>
)
}

