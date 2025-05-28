import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header.jsx";

function Profile() {
  const navigate = useNavigate();

  // Example profile data
  const profile = {
    email: "dangnguyen180904@gmail.com",
    phone: "0123456789",
    dateOfBirth: "1998-04-28",
    gender: "Man",
    heightCm: 175,
    weightKg: 70,
    asthma: false,
    respiratoryDisease: false,
    heartDisease: false,
    allergies: true,
    pregnant: false,
    smoker: true,
    otherConditions: "None",
    location: "Use approximate location (based on IP)",
  };

  // Helper to display boolean nicely
  const boolToYesNo = (val) => {
    if (val === null || val === undefined) return "Not provided";
    return val ? "Yes" : "No";
  };

  return (
    <div className="home-page">
      <Header />
      <div className="dashboard settings-container">
        <div className="settings-content">
          <div
            className="profile-header"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
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
                <span className="settings-value">
                  {profile.pregnant === null
                    ? "Not provided"
                    : profile.pregnant
                    ? "Yes"
                    : "No"}
                </span>
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
  );
}

export default Profile;
