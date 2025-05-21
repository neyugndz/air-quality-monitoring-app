import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login.jsx";
import Register from './components/register.jsx';
import ForgotPassword from './components/forgotPassword.jsx';
import ResetPassword from "./components/resetPassword.jsx";
import './App.css';
import VerificationPage from "./components/verification.jsx";
import Home from "./components/home.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={< Home/>}/>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify" element={<VerificationPage />}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
