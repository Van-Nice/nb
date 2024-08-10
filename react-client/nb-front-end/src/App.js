import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import EmailConfirmation from "./components/EmailConfirmation";
import './App.css';

// TODO: 3. Create a navigation bar that will allow the user to navigate between the pages
// TODO: 4. Create a footer that will display the current year and the company name
// TODO: 5. Create a form that will allow the user to create an account
// TODO: 6. Create a form that will allow the user to login
// TODO: 7. Create a form that will allow the user to create a post via the text editor


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/email-confirmation" element={<EmailConfirmation/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/create-account" element={<CreateAccount/>}/>
          <Route path="/home" element={<Home/>}/>
          <Route path="/" element={<Navigate to="/login"/>}/>
        </Routes>
        <footer>
          <p>&copy; 2024 Bungo</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
