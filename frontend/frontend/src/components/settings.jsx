import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import '../css/settings.css'
import ToggleSwitch from "./ToggleSwitch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import Header from "./header.jsx";
import { UserService } from "../service/userService.js";

// TODO: Add the Edit, Save button for the Input field (Disable the Input by default)
function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);

    
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "preferences", label: "Preferences" },
    { key: "notifications", label: "Notifications" },
  ]; 

  // Fetch profile and preferences data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile
        const profileResponse = await UserService.single();
        setProfile(profileResponse.data);

      } catch (error) {
        console.error("Error fetching profile or preferences:", error);
      }
    };

    fetchData();
  }, []);

  if (profile === null) {
    return <div>Loading...</div>;  // Display loading message while waiting for profile data
  }

  return (
    <div className="home-page">
      <Header toggleSidebar={toggleSidebar}/>
        {/* Sidebar */}
        <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <ul>
            <li><Link to="/home">
              <i className="fas fa-tachometer-alt"></i> Dashboard
              </Link></li>
            <li><Link to="/trend-analysis">
              <i className="fas fa-chart-line"></i> Trend Analysis
              </Link></li>
            <li><Link to="/health-recommendations">
              <i className="fas fa-heart"></i> Health Recommendation
              </Link></li>
            <li><Link to="/forecast">
              <i className="fas fa-cloud-sun"></i> Forecast
              </Link></li>
          </ul>
        </div>
    <div className={`page ${isSidebarOpen ? 'shifted' : ''}`}>

      <div className="dashboard settings-container">
        <div className="settings-content">
          <h1 className="settings-title">Settings</h1>

          <nav className="settings-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`settings-tab-button ${activeTab === tab.key ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content of Tab */}
        {activeTab === "profile" && <ProfileTab profile={profile} setProfile={setProfile} />}
        {activeTab === "preferences" && <PreferencesTab />}
        {activeTab === "notifications" && <NotificationsTab />}

        </div>
      </div>
    </div>
  </div>
  );
}


function EditableField({ 
  label, 
  type = "text", 
  options = null, 
  value, 
  onSave 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || "");

  const startEdit = () => {
    setTempValue(value || "");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setTempValue(value || "");
    setIsEditing(false);
  };

  const saveEdit = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  return (
    <li className="settings-item">
      <label>{label}</label>
      {isEditing ? (
        <>
          {options ? (
            <select
              className="settings-select"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
            >
              <option value="">Select</option>
              {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              className="settings-input"
              value={tempValue}
              onChange={e => setTempValue(e.target.value)}
              min={type === "number" ? 0 : undefined}
              max={type === "number" ? 120 : undefined}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          )}
          <button className="btn-save" onClick={saveEdit}>Save</button>
          <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
        </>
      ) : (
        <>
          <span className="settings-value">{value || (type === "password" ? "********" : "Not provided")}</span>
          <FontAwesomeIcon
            icon={faPencil}
            className="edit-icon"
            role="button"
            tabIndex={0}
            aria-label={`Edit ${label}`}
            onClick={startEdit}
            onKeyDown={e => { if (e.key === "Enter") startEdit(); }}
          />
        </>
      )}
    </li>
  );
}

function ProfileTab({ profile, setProfile }) {
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [heightCm, setHeightCm] = useState(profile.heightCm || "");
  const [weightKg, setWeightKg] = useState(profile.weightKg || "");
  const [locationCustomization, setLocationCustomization] = useState(profile.locationCustomization || "");

  // Convert "yes" / "no" to boolean values
  const [asthma, setAsthma] = useState(profile.asthma === "yes" ? true : false);
  const [respiratoryDisease, setRespiratoryDisease] = useState(profile.respiratoryDisease === "yes" ? true : false);
  const [heartDisease, setHeartDisease] = useState(profile.heartDisease === "yes" ? true : false);
  const [allergies, setAllergies] = useState(profile.allergies === "yes" ? true : false);
  const [pregnant, setPregnant] = useState(profile.pregnant === "yes" ? true : false);
  const [smoker, setSmoker] = useState(profile.smoker === "yes" ? true : false);
  const [otherConditions, setOtherConditions] = useState(profile.otherConditions || "");

  // Handle Save Changes
  const handleSave = () => {
    const updatedProfile = {
      email,
      phone,
      dateOfBirth,
      gender,
      heightCm,
      weightKg,
      locationCustomization,
      asthma: asthma ? "yes" : "no",  // Convert boolean back to "yes" or "no"
      respiratoryDisease: respiratoryDisease ? "yes" : "no",
      heartDisease: heartDisease ? "yes" : "no",
      allergies: allergies ? "yes" : "no",
      pregnant: pregnant ? "yes" : "no",
      smoker: smoker ? "yes" : "no",
      otherConditions
    };

    setProfile(updatedProfile);  // Update the profile in the parent state (or send to backend)
    console.log("Profile updated:", updatedProfile);  // For now, log the updated profile
  };

  return (
    <div className="tab-content profile-tab">
      <section>
        <h2 className="section-title">Personal Info</h2>
        <ul className="settings-list">
          <EditableField label="Email address" type="email" value={email} onSave={setEmail} />
          <EditableField label="Phone Number" type="tel" value={phone} onSave={setPhone} />
          <EditableField label="Date of Birth" type="date" value={dateOfBirth} onSave={setDateOfBirth} />
          <EditableField
            label="Gender"
            options={[
              { value: "Man", label: "Man" },
              { value: "Woman", label: "Woman" },
              { value: "Other", label: "Other" },
              { value: "Prefer not to say", label: "Prefer not to say" },
            ]}
            value={gender}
            onSave={setGender}
          />
          <EditableField label="Height (cm)" type="number" value={heightCm} onSave={setHeightCm} />
          <EditableField label="Weight (kg)" type="number" value={weightKg} onSave={setWeightKg} />
        </ul>
      </section>

      <section>
        <h2 className="section-title">Health Conditions</h2>
        <ul className="settings-list">
          <EditableField
            label="Asthma"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={asthma ? "yes" : "no"}  // Display "yes" or "no"
            onSave={setAsthma}
          />
          <EditableField
            label="Respiratory Disease"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={respiratoryDisease ? "yes" : "no"}
            onSave={setRespiratoryDisease}
          />
          <EditableField
            label="Heart Disease"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={heartDisease ? "yes" : "no"}
            onSave={setHeartDisease}
          />
          <EditableField
            label="Allergies"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={allergies ? "yes" : "no"}
            onSave={setAllergies}
          />
          <EditableField
            label="Pregnancy"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not-applicable", label: "Not applicable" },
            ]}
            value={pregnant ? "yes" : "no"}
            onSave={setPregnant}
          />
          <EditableField
            label="Smoker"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            value={smoker ? "yes" : "no"}
            onSave={setSmoker}
          />
          <EditableField
            label="Other Conditions"
            type="text"
            value={otherConditions}
            onSave={setOtherConditions}
          />
        </ul>
      </section>

      <section>
        <h2 className="section-title">Account</h2>
        <ul className="settings-list">
          <EditableField
            label="Location customization"
            options={[
              { value: "Use approximate location (based on IP)", label: "Use approximate location (based on IP)" },
              { value: "Use exact location (GPS)", label: "Use exact location (GPS)" },
              { value: "Set location manually", label: "Set location manually" },
            ]}
            value={locationCustomization}
            onSave={setLocationCustomization}
          />
        </ul>
      </section>

      <button className="save-profile-button" onClick={handleSave}>
        Save Changes
      </button>
    </div>
  );
}

  function PreferencesTab() {
    const [displayLanguage, setDisplayLanguage] = useState("English");
    const [showPollutionAlerts, setShowPollutionAlerts] = useState(true);
    const [showHealthTips, setShowHealthTips] = useState(true);
    const [useLocation, setUseLocation] = useState(true);
  
    return (
      <div className="tab-content profile-tab">
        <section>
          <h2 className="section-title">Language</h2>
          <ul className="settings-list">
            <li className="settings-item">
              <label>Display language</label>
              <select
                value={displayLanguage}
                onChange={(e) => setDisplayLanguage(e.target.value)}
                className="settings-select"
              >
                <option>English</option>
                <option>Vietnamese</option>
              </select>
            </li>
          </ul>
        </section>
  
        <section>
          <h2 className="section-title">Content</h2>
          <ul className="settings-list">
            <li className="settings-item toggle-item">
                <label htmlFor="showPollutionAlerts">Show pollution alerts</label>
                <ToggleSwitch
                    Name="showPollutionAlerts"
                    checked={showPollutionAlerts}
                    onChange={() => setShowPollutionAlerts(!showPollutionAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="showHealthRecommendations">Show health recommendations</label>
                <ToggleSwitch
                    Name="showHealthRecommendations"
                    checked={showHealthTips}
                    onChange={() => setShowHealthTips(!showHealthTips)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="allowPersonalizeLocation">Allow location access for personalized data</label>
                <ToggleSwitch
                    Name="allowPersonalizeLocation"
                    checked={useLocation}
                    onChange={() => setUseLocation(!useLocation)}
                />
            </li>
          </ul>
        </section>
      </div>
    );
  }
  
  function NotificationsTab() {
    const [emailAlerts, setEmailAlerts] = useState(true);
    const [pushAlerts, setPushAlerts] = useState(true);
    const [smsAlerts, setSmsAlerts] = useState(false);
  
    const [aqiThreshold, setAqiThreshold] = useState(100);
    const [alertFrequency, setAlertFrequency] = useState("Immediate");
  
    return (
      <div className="tab-content profile-tab">
        <section>
          <h2 className="section-title">Notification Channels</h2>
          <ul className="settings-list">
            <li className="settings-item">
                <label htmlFor="emailAlerts">Email Alerts</label>
                <ToggleSwitch 
                    Name="emailAlerts"
                    checked={emailAlerts}
                    onChange={() => setEmailAlerts(!emailAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="pushNoti">Push Notifications</label>
                <ToggleSwitch 
                    Name="pushNoti"
                    checked={pushAlerts}
                    onChange={() => setPushAlerts(!pushAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="SMSAlerts">SMS Alerts</label>
                <ToggleSwitch 
                    Name="SMSAlerts"
                    checked={smsAlerts}
                    onChange={() => setSmsAlerts(!smsAlerts)}
                />
            </li>
          </ul>
        </section>
  
        <section>
          <h2 className="section-title">Alert Settings</h2>
          <ul className="settings-list">
            <li className="settings-item">
              <label htmlFor="aqi-threshold" style={{ width: "70%" }}>
                AQI Threshold for Alerts
              </label>
              <input
                id="aqi-threshold"
                type="number"
                min={0}
                max={500}
                value={aqiThreshold}
                onChange={(e) => setAqiThreshold(Number(e.target.value))}
                className="settings-input"
                style={{ width: "25%" }}
              />
            </li>
            <li className="settings-item">
              <label htmlFor="alert-frequency" style={{ width: "70%" }}>
                Notification Frequency
              </label>
              <select
                id="alert-frequency"
                value={alertFrequency}
                onChange={(e) => setAlertFrequency(e.target.value)}
                className="settings-select"
                style={{ width: "25%" }}
              >
                <option>Immediate</option>
                <option>Daily Summary</option>
                <option>Weekly Summary</option>
              </select>
            </li>
          </ul>
        </section>
      </div>
    );
  }

  
export default Settings;
