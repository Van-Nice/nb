import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./UserContext";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import EmailConfirmation from "./components/EmailConfirmation";
import EmailConfirmationInstruction from "./components/EmailConfirmationInstruction";
import ProtectedRoute from "./components/ProtectedRoute";
import DocumentEditor from "./components/DocumentEditor";
import "./App.css";

function App() {
  return (
    <UserProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/document/:id" element={<ProtectedRoute element={DocumentEditor} />}/>
            <Route
              path="/email-confirmation-instruction"
              element={<EmailConfirmationInstruction />}
            />
            <Route path="/email-confirmation" element={<EmailConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/create-account" element={<CreateAccount />} />
            <Route path="/home" element={<ProtectedRoute  element={Home}/>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
          {/* <footer>
            <p>&copy; 2024 Bungo</p>
          </footer> */}
        </div>
      </Router>

    </UserProvider>
  );
}

export default App;
