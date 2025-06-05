import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/login.jsx";
import Register from './components/register.jsx';
import ForgotPassword from './components/forgotPassword.jsx';
import ResetPassword from "./components/resetPassword.jsx";
import './App.css';
import VerificationPage from "./components/verification.jsx";
import Dashboard from "./components/dashboard.jsx";
import ForecastPage from "./components/forecastPage.jsx";
import HealthRecommendationPage from "./components/healthRcmPage.jsx";
import Settings from "./components/settings.jsx";
import Profile from "./components/profile.jsx";
import ProtectedRoute from "./config/ProtectedRoute.js";

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

        <Route path="/home" element={<Dashboard />}/>
        <Route path="/forecast" element={<ForecastPage />}/>
        <Route path="/health-recommendations" element={<HealthRecommendationPage />}/>
        <Route path="/settings" element={<Settings />}/>
        <Route path="/profile" element={<Profile />}/>
        
        {/* <Route
          path="/home"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route
          path="/forecast"
          element={<ProtectedRoute element={<ForecastPage />} />}
        />
        <Route
          path="/health-recommendations"
          element={<ProtectedRoute element={<HealthRecommendationPage />} />}
        />
        <Route
          path="/settings"
          element={<ProtectedRoute element={<Settings />} />}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute element={<Profile />} />}
        /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
