import React from "react";
import { useNavigate } from "react-router-dom";
import Header from "./header.jsx";

function Profile() {
  const navigate = useNavigate();

  // Example profile data
  const profile = {
    email: "dangnguyen180904@gmail.com",
    phone: "0123456789",
    gender: "Man",
    location: "Use approximate location (based on IP)",
    age: 25,
    respiratoryCondition: "No",
    smokingStatus: "Non-smoker",
    pregnancyStatus: "Not applicable",
  };

  return (
    <div className="home-page">
      <Header />
      <div className="dashboard settings-container">
        <div className="settings-content">
        <div className="profile-header">
            <h1 className="settings-title">Profile</h1>
            <button
            onClick={() => navigate("/settings")}
            className="edit-profile-button"
            aria-label="Edit Profile"
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
            </ul>
          </section>

          <section>
            <h2 className="section-title">Account</h2>
            <ul className="settings-list no-pointer">
              <li className="settings-item">
                <label>Gender</label>
                <span className="settings-value">{profile.gender || "Not set"}</span>
              </li>
              <li className="settings-item">
                <label>Location customization</label>
                <span className="settings-value">{profile.location || "Not set"}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="section-title">Health Information</h2>
            <ul className="settings-list no-pointer">
              <li className="settings-item">
                <label>Age</label>
                <span className="settings-value">{profile.age || "Not provided"}</span>
              </li>
              <li className="settings-item">
                <label>Respiratory or heart condition</label>
                <span className="settings-value">{profile.respiratoryCondition || "Not provided"}</span>
              </li>
              <li className="settings-item">
                <label>Smoking status</label>
                <span className="settings-value">{profile.smokingStatus || "Not provided"}</span>
              </li>
              <li className="settings-item">
                <label>Pregnancy status</label>
                <span className="settings-value">{profile.pregnancyStatus || "Not provided"}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
