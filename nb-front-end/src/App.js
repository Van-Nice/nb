import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { UserProvider } from "./UserContext";
import { ThemeProvider } from "./ThemeContext";
import Login from "./components/Login";
import CreateAccount from "./components/CreateAccount";
import Home from "./components/Home";
import EmailConfirmation from "./components/EmailConfirmation";
import EmailConfirmationInstruction from "./components/EmailConfirmationInstruction";
import ProtectedRoute from "./components/ProtectedRoute";
import DocumentEditor from "./components/DocumentEditor";
import Suggested from "./components/Suggested";
import "./App.css";

// This is the frontend for the development branch for bungo text editor

function App() {
  return (
    <UserProvider>
      <ThemeProvider>
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
              <Route path="/home" element={<ProtectedRoute element={Home} />}>
                <Route index element={<Suggested />} /> {/* Default when /home is accessed */}
                <Route path="folders/:folderID" element={<Suggested />} />
                <Route path="trash/" element={<Suggested />} />
              </Route>
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </Router>
      </ThemeProvider>

    </UserProvider>
  );
}

export default App;
