import React from "react";
import { Link } from "react-router-dom";

export default function EmailConfirmationInstruction() {
  return (
    // TODO: design page
    <div>
      <div>
        You have been sent a email to verify your email address. After verifying
        your email you can login
      </div>
      <Link to="/login">Login</Link>
    </div>
  );
}
