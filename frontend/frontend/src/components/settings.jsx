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
  const [preferences, setPreferences] = useState(null);

    
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

        // Fetch user preferences
        const prefRespone = await UserService.singlePreferences();
        setPreferences(prefRespone.data);

      } catch (error) {
        console.error("Error fetching profile or preferences:", error);
      }
    };

    fetchData();
  }, []);

  // Patch Profile Method Defined
  const patchProfile = async (updatedProfileData) => {
    try {
      await UserService.patchProfile(updatedProfileData);
      setProfile(updatedProfileData);
      // alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile");
    }
  }

  // Patch Preference Method Defined
  const patchPreferences = async (updatedPreferecesData) => {
    try {
      await UserService.patchPreferences(updatedPreferecesData);
      setPreferences(updatedPreferecesData); 

    } catch (err) {
      console.error("Error updating preferences", err);
      alert("Failed to update preferences");
    }
  }

  if (!profile || !preferences) {
    return <div>Loading...</div>; 
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
        {activeTab === "profile" && <ProfileTab 
                                      profile={profile} 
                                      preferences={preferences} 
                                      patchProfile={patchProfile}
                                      patchPreferences={patchPreferences}
                                      />}
        {activeTab === "preferences" && <PreferencesTab 
                                      preferences={preferences}
                                      patchPreferences={patchPreferences}
                                      />}
        {activeTab === "notifications" && <NotificationsTab 
                                      preferences={preferences}
                                      patchPreferences={patchPreferences}
                                      />}

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

function ProfileTab({ profile, preferences, patchProfile, patchPreferences }) {
  const [email, setEmail] = useState(profile.email || "");
  const [phone, setPhone] = useState(profile.phoneNumber || "");
  const [dateOfBirth, setDateOfBirth] = useState(profile.dateOfBirth || "");
  const [gender, setGender] = useState(profile.gender || "");
  const [heightCm, setHeightCm] = useState(profile.heightCm || "");
  const [weightKg, setWeightKg] = useState(profile.weightKg || "");
  const [locationCustomization, setLocationCustomization] = useState(preferences.locationCustomization || "");

  const [asthma, setAsthma] = useState(profile.asthma || "");
  const [respiratoryDisease, setRespiratoryDisease] = useState(profile.respiratoryDisease || "");
  const [heartDisease, setHeartDisease] = useState(profile.heartDisease || "");
  const [allergies, setAllergies] = useState(profile.allergies || "");
  const [pregnant, setPregnant] = useState(profile.pregnant || "");
  const [smoker, setSmoker] = useState(profile.smoker || "");
  const [otherConditions, setOtherConditions] = useState(profile.otherConditions || "");

  // Handle profile updated
  const handleFieldChange = (field, value) => {
    // Convert "Yes/ No to boolean true/ false"
    if (value === "Yes") value = true;
    if (value === "No") value = false;

    if (field === "email") setEmail(value);
    if (field === "phone") setPhone(value);
    if (field === "dateOfBirth") setDateOfBirth(value);
    if (field === "gender") setGender(value);
    if (field === "heightCm") setHeightCm(value);
    if (field === "weightKg") setWeightKg(value);
    if (field === "locationCustomization") setLocationCustomization(value);
    if (field === "asthma") setAsthma(value);
    if (field === "respiratoryDisease") setRespiratoryDisease(value);
    if (field === "heartDisease") setHeartDisease(value);
    if (field === "allergies") setAllergies(value);
    if (field === "pregnant") setPregnant(value);
    if (field === "smoker") setSmoker(value);
    if (field === "otherConditions") setOtherConditions(value);

    const updatedProfile = {
      ...profile,
      [field]: value, 
    };

    patchProfile(updatedProfile); 
  }

  const handlePreferencesUpdate = (field, value) => {
    if (field === "locationCustomization") setLocationCustomization(value);

    const updatedPrefereces = {
      ...preferences,
      [field]: value, 
    };

    patchPreferences(updatedPrefereces); 
  }



  return (
    <div className="tab-content profile-tab">
      <section>
        <h2 className="section-title">Personal Info</h2>
        <ul className="settings-list">
          <EditableField label="Email address" type="email" value={email} onSave={(value) => handleFieldChange("email", value)} />
          <EditableField label="Phone Number" type="tel" value={phone} onSave={(value) => handleFieldChange("phone", value)} />
          <EditableField label="Date of Birth" type="date" value={dateOfBirth} onSave={(value) => handleFieldChange("dateOfBirth", value)} />
          <EditableField
            label="Gender"
            options={[
              { value: "Male", label: "Male" },
              { value: "Female", label: "Female" },
              { value: "Other", label: "Other" },
              { value: "Prefer not to say", label: "Prefer not to say" },
            ]}
            value={gender}
            onSave={(value) => handleFieldChange("gender", value)}
          />
          <EditableField label="Height (cm)" type="number" value={heightCm} onSave={(value) => handleFieldChange("heightCm", value)} />
          <EditableField label="Weight (kg)" type="number" value={weightKg} onSave={(value) => handleFieldChange("weightKg", value)} />
        </ul>
      </section>

      <section>
        <h2 className="section-title">Health Conditions</h2>
        <ul className="settings-list">
          <EditableField label="Asthma" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]} value={asthma ? "Yes" : "No"} onSave={(value) => handleFieldChange("asthma", value)} />
          <EditableField label="Respiratory Disease" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]} value={respiratoryDisease ? "Yes" : "No"} onSave={(value) => handleFieldChange("respiratoryDisease", value)} />
          <EditableField label="Heart Disease" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]} value={heartDisease ? "Yes" : "No"} onSave={(value) => handleFieldChange("heartDisease", value)} />
          <EditableField label="Allergies" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]} value={allergies ? "Yes" : "No"} onSave={(value) => handleFieldChange("allergies", value)} />
          <EditableField label="Pregnancy" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
            { value: "Not-applicable", label: "Not applicable" },
          ]} value={pregnant ? "Yes" : "No"} onSave={(value) => handleFieldChange("pregnant", value)} />
          <EditableField label="Smoker" options={[
            { value: "Yes", label: "Yes" },
            { value: "No", label: "No" },
          ]} value={smoker ? "Yes" : "No"} onSave={(value) => handleFieldChange("smoker", value)} />
          <EditableField label="Other Conditions" type="text" value={otherConditions} onSave={(value) => handleFieldChange("otherConditions", value)} />
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
            onSave={(value) => handlePreferencesUpdate("locationCustomization", value)}
          />
        </ul>
      </section>
    </div>
  );
}

  function PreferencesTab({preferences, patchPreferences}) {
    const [displayLanguage, setDisplayLanguage] = useState(preferences.displayLanguage || "");
    const [showPollutionAlerts, setShowPollutionAlerts] = useState(preferences.showPollutionAlerts);
    const [showHealthTips, setShowHealthTips] = useState(preferences.showHealthTips);
    // const [useLocation, setUseLocation] = useState(true);

    const handleFieldChange = (field, value) => {
      if (field === "showPollutionAlerts") value = !showPollutionAlerts;
      if (field === "showHealthTips") value = !showHealthTips;
      
      if (field === "displayLanguage") setDisplayLanguage(value);
      if (field === "showPollutionAlerts") setShowPollutionAlerts(value);
      if (field === "showHealthTips") setShowHealthTips(value);

      const updatedPrefereces = {
        ...preferences,
        [field]: value, 
      };
  
      patchPreferences(updatedPrefereces);     
    }
  
    return (
      <div className="tab-content profile-tab">
        <section>
          <h2 className="section-title">Language</h2>
          <ul className="settings-list">
            <li className="settings-item">
              <label>Display language</label>
              <select
                value={displayLanguage}
                onChange={(e) => handleFieldChange("displayLanguage", e.target.value)}
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
                    onChange={() => handleFieldChange("showPollutionAlerts", !showPollutionAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="showHealthRecommendations">Show health recommendations</label>
                <ToggleSwitch
                    Name="showHealthRecommendations"
                    checked={showHealthTips}
                    onChange={() => handleFieldChange("showHealthTips", !showHealthTips)}
                />
            </li>
            {/* <li className="settings-item">
                <label htmlFor="allowPersonalizeLocation">Allow location access for personalized data</label>
                <ToggleSwitch
                    Name="allowPersonalizeLocation"
                    checked={useLocation}
                    onChange={() => setUseLocation(!useLocation)}
                />
            </li> */}
          </ul>
        </section>
      </div>
    );
  }
  
  function NotificationsTab({preferences, patchPreferences}) {
    const [emailAlerts, setEmailAlerts] = useState(preferences.emailAlerts);
    const [pushAlerts, setPushAlerts] = useState(preferences.pushAlerts);
    const [smsAlerts, setSmsAlerts] = useState(preferences.smsAlerts);
  
    const [aqiThreshold, setAqiThreshold] = useState(preferences.aqiThreshold ||100);
    const [notificationFrequency, setNotificationFrequency] = useState(preferences.notificationFrequency ||"Immediate");
    
    const handleFieldChange = (field, value) => {
      if (field === "emailAlerts") value = !emailAlerts;
      if (field === "pushAlerts") value = !pushAlerts;
      if (field === "smsAlerts") value = !smsAlerts;
      
      if (field === "emailAlerts") setEmailAlerts(value);
      if (field === "pushAlerts") setPushAlerts(value);
      if (field === "smsAlerts") setSmsAlerts(value);
      if (field === "aqiThreshold") setAqiThreshold(value);
      if (field === "notificationFrequency") setNotificationFrequency(value);

      const updatedPrefereces = {
        ...preferences,
        [field]: value, 
      };
  
      patchPreferences(updatedPrefereces);     
    }

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
                    onChange={() => handleFieldChange("emailAlerts",!emailAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="pushNoti">Push Notifications</label>
                <ToggleSwitch 
                    Name="pushNoti"
                    checked={pushAlerts}
                    onChange={() => handleFieldChange("pushAlerts",!pushAlerts)}
                />
            </li>
            <li className="settings-item">
                <label htmlFor="SMSAlerts">SMS Alerts</label>
                <ToggleSwitch 
                    Name="SMSAlerts"
                    checked={smsAlerts}
                    onChange={() => handleFieldChange("smsAlerts",!smsAlerts)}
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
                onChange={(e) => handleFieldChange("aqiThreshold", e.target.value)}
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
                value={notificationFrequency}
                onChange={(e) => handleFieldChange("notificationFrequency", e.target.value)}
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
