import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "./header.jsx";
import { UserService } from "../service/userService.js";

function Profile() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null); // State for user profile

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Fetch profile data from the API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await UserService.single(); // Call the backend to get user data
        setProfile(response.data); // Set profile data
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // Helper to display boolean values as "Yes" or "No"
  const boolToYesNo = (val) => {
    if (val === null || val === undefined) return "Not provided";
    return val ? "Yes" : "No";
  };

  if (!profile) {
    return <div>Loading...</div>; // Show loading state until profile data is fetched
  }

  return (
    <div className="home-page">
      <Header toggleSidebar={toggleSidebar} />
      
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/home"><i className="fas fa-tachometer-alt"></i> Dashboard</Link></li>
          <li><Link to="/trend-analysis"><i className="fas fa-chart-line"></i> Trend Analysis</Link></li>
          <li><Link to="/health-recommendations"><i className="fas fa-heart"></i> Health Recommendation</Link></li>
          <li><Link to="/forecast"><i className="fas fa-cloud-sun"></i> Forecast</Link></li>
        </ul>
      </div>

      <div className={`page ${isSidebarOpen ? 'shifted' : ''}`}>
        <div className="dashboard settings-container">
          <div className="settings-content">
            <div className="profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h1 className="settings-title">Profile</h1>
              <button
                onClick={() => navigate("/settings")}
                className="edit-profile-button"
                aria-label="Edit Profile"
                style={{
                  backgroundColor: "#004c9b",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Edit Profile
              </button>
            </div>

            <section>
              <h2 className="section-title">Personal Info</h2>
              <ul className="settings-list no-pointer">
                <li className="settings-item">
                  <label>Email address</label>
                  <span className="settings-value">{profile.email || "Not set"}</span>
                </li>
                <li className="settings-item">
                  <label>Phone Number</label>
                  <span className="settings-value">{profile.phone || "Not set"}</span>
                </li>
                <li className="settings-item">
                  <label>Date of Birth</label>
                  <span className="settings-value">{profile.dateOfBirth || "Not provided"}</span>
                </li>
                <li className="settings-item">
                  <label>Gender</label>
                  <span className="settings-value">{profile.gender || "Not set"}</span>
                </li>
                <li className="settings-item">
                  <label>Height (cm)</label>
                  <span className="settings-value">{profile.heightCm || "Not provided"}</span>
                </li>
                <li className="settings-item">
                  <label>Weight (kg)</label>
                  <span className="settings-value">{profile.weightKg || "Not provided"}</span>
                </li>
                <li className="settings-item">
                  <label>Location customization</label>
                  {/* The location preferences is from the User Preferences */}
                  <span className="settings-value">{profile.location || "Not set"}</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="section-title">Health Conditions</h2>
              <ul className="settings-list no-pointer">
                <li className="settings-item">
                  <label>Asthma</label>
                  <span className="settings-value">{boolToYesNo(profile.asthma)}</span>
                </li>
                <li className="settings-item">
                  <label>Respiratory Disease</label>
                  <span className="settings-value">{boolToYesNo(profile.respiratoryDisease)}</span>
                </li>
                <li className="settings-item">
                  <label>Heart Disease</label>
                  <span className="settings-value">{boolToYesNo(profile.heartDisease)}</span>
                </li>
                <li className="settings-item">
                  <label>Allergies</label>
                  <span className="settings-value">{boolToYesNo(profile.allergies)}</span>
                </li>
                <li className="settings-item">
                  <label>Pregnancy</label>
                  <span className="settings-value">{profile.pregnant === null ? "Not provided" : boolToYesNo(profile.pregnant)}</span>
                </li>
                <li className="settings-item">
                  <label>Smoker</label>
                  <span className="settings-value">{boolToYesNo(profile.smoker)}</span>
                </li>
                <li className="settings-item">
                  <label>Other Conditions</label>
                  <span className="settings-value">{profile.otherConditions || "None"}</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
