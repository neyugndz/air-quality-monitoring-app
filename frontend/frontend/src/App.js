import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login.js";
import Register from './components/register.js';
import ForgotPassword from './components/forgotPassword.js';
import ResetPassword from "./components/resetPassword.js";
import './App.css';
import VerificationPage from "./components/verification.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerificationPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
