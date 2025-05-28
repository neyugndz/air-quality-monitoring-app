import { useState } from "react";
import { Link } from "react-router-dom";
import '../css/settings.css'
import ToggleSwitch from "./ToggleSwitch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil } from "@fortawesome/free-solid-svg-icons";
import Header from "./header.jsx";

// TODO: Add the Edit, Save button for the Input field (Disable the Input by default)
function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { key: "profile", label: "Profile" },
    { key: "preferences", label: "Preferences" },
    { key: "notifications", label: "Notifications" },
  ];

  return (
    <div className="home-page">
      <Header />

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
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "preferences" && <PreferencesTab />}
        {activeTab === "notifications" && <NotificationsTab />}

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

function ProfileTab() {
  const [email, setEmail] = useState("dangnguyen180904@gmail.com");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Man");
  const [location, setLocation] = useState("Use approximate location (based on IP)");
  const [age, setAge] = useState("");
  const [hasRespiratoryCondition, setHasRespiratoryCondition] = useState("");
  const [smokingStatus, setSmokingStatus] = useState("");
  const [pregnant, setPregnant] = useState("");

  return (
    <div className="tab-content profile-tab">
      <section>
        <h2 className="section-title">Personal Info</h2>
        <ul className="settings-list">
          <EditableField label="Email address" type="email" value={email} onSave={setEmail} />
          <EditableField label="Phone Number" type="tel" value={phone} onSave={setPhone} />
          <EditableField label="Password" type="password" value="********" onSave={() => {}} />
        </ul>
      </section>

      <section>
        <h2 className="section-title">Account</h2>
        <ul className="settings-list">
          <EditableField
            label="Gender"
            options={[
              { value: "Man", label: "Man" },
              { value: "Woman", label: "Woman" },
              { value: "Other", label: "Other" },
              { value: "Prefer not to say", label: "Prefer not to say" }
            ]}
            value={gender}
            onSave={setGender}
          />
          <EditableField
            label="Location customization"
            options={[
              { value: "Use approximate location (based on IP)", label: "Use approximate location (based on IP)" },
              { value: "Use exact location (GPS)", label: "Use exact location (GPS)" },
              { value: "Set location manually", label: "Set location manually" }
            ]}
            value={location}
            onSave={setLocation}
          />
        </ul>
      </section>

      <section>
        <h2 className="section-title">Health Information</h2>
        <ul className="settings-list">
          <EditableField label="Age" type="number" value={age} onSave={setAge} />
          <EditableField
            label="Respiratory or heart condition"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" }
            ]}
            value={hasRespiratoryCondition}
            onSave={setHasRespiratoryCondition}
          />
          <EditableField
            label="Smoking status"
            options={[
              { value: "smoker", label: "Smoker" },
              { value: "non-smoker", label: "Non-smoker" },
              { value: "former-smoker", label: "Former smoker" }
            ]}
            value={smokingStatus}
            onSave={setSmokingStatus}
          />
          <EditableField
            label="Pregnancy status"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
              { value: "not-applicable", label: "Not applicable" }
            ]}
            value={pregnant}
            onSave={setPregnant}
          />
        </ul>
      </section>
    </div>
  );
}
  
  function PreferencesTab() {
    const [displayLanguage, setDisplayLanguage] = useState("English");
    const [units, setUnits] = useState("µg/m³");
    const [showPollutionAlerts, setShowPollutionAlerts] = useState(true);
    const [showHealthTips, setShowHealthTips] = useState(true);
    const [useLocation, setUseLocation] = useState(true);
  
    return (
      <div className="tab-content profile-tab">
        <section>
          <h2 className="section-title">Language & Units</h2>
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
            <li className="settings-item">
              <label>Units of measurement</label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value)}
                className="settings-select"
              >
                <option>µg/m³</option>
                <option>ppm</option>
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
