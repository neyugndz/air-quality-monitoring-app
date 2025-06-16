import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from './header.jsx';
import { UserService } from '../service/userService.js';
import { DeviceService } from '../service/deviceService.js';

function HealthRecommendationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [deviceData, setDeviceData] = useState(null);
  const [aqi, setAqi] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();

  /**
   * Fetch User Profile
   */
  useEffect(() => {
    UserService.single()
      .then(res => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching profile", err);
        setLoading(false);
      })
  }, [])
  
  /**
   * Fetch User Profile
   */
  useEffect(() => {
    UserService.singlePreferences()
      .then(res => {
        setPreferences(res.data);
      })
      .catch(err => {
        console.error("Error fetching preferences", err);
      });
  }, []);

  /**
   * Fetch nearest station data
   */
  useEffect(() => {
    DeviceService.nearestStation()
      .then(res => {
        setDeviceData(res.data);
        setAqi(res.data.overallAqi);
      })
      .catch(err => {
        console.error('Error fetching nearest station', err);
      });
  }, []);

  /**
   * If profile and prefereces data is not available, redirect to the settings page
   */
  useEffect(() => {
    if (profile && preferences) {
      // Check if any necessary profile fields are missing (null or undefined)
      const isProfileIncomplete = Object.values(profile).some(value => value === null || value === undefined);

      const isPreferencesIncomplete = Object.values(preferences).some(value => value === null || value === undefined);

      if (isProfileIncomplete || isPreferencesIncomplete) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false); 
      }
    }
  }, [profile, preferences]); 


  const generateHealthAdvice = (aqi, profile, threshold) => {
    let adviceList = [];

    if (aqi <= threshold) {
      adviceList.push(`The air quality is good (AQI: ${aqi}). You can enjoy outdoor activities.`);
    } else if (aqi <= 150) {
      adviceList.push(`The air quality is moderate (AQI: ${aqi}). Sensitive individuals should limit outdoor activities.`);
      if (profile?.asthma || profile?.respiratoryDisease) {
        adviceList.push("Consider staying indoors or using a mask.");
      }
      if (profile?.pregnant || profile?.smoker) {
        adviceList.push("Pregnant individuals and smokers should avoid outdoor exposure.");
      }
    } else if (aqi <= 200) {
      adviceList.push(`The air quality is unhealthy (AQI: ${aqi}). Stay indoors if possible.`);
      if (profile?.asthma || profile?.respiratoryDisease) {
        adviceList.push("Consider staying indoors or using a mask.");
      }
      if (profile?.pregnant || profile?.smoker) {
        adviceList.push("Pregnant individuals and smokers should avoid outdoor exposure.");
      }
    } else if (aqi <= 300) {
      adviceList.push(`The air quality is very unhealthy (AQI: ${aqi}). Avoid all outdoor activities.`);
    } else {
      adviceList.push(`The air quality is hazardous (AQI: ${aqi}). Remain indoors with windows closed.`);
    }

    return adviceList;
  };

  
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  const handlePromptClose = (shouldRedirect) => {
    if (shouldRedirect) {
      navigate('/profile');
    }
    setShowPrompt(false); // Close the prompt
  };


return (
    <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
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

      {/* Page Content */}
      <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8' }}>
        <div style={{ padding: '24px', maxWidth: '900px', margin: ' 30px auto 40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#253892', marginBottom: '16px' }}>
            Personalized Health Recommendations
          </h2>

          {loading ? (
            <div>Loading...</div>
          ) : (
            <>
              <p style={{ fontSize: '15px', color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
                Based on the current air quality index and your sensitivity profile, please follow the guidance below to protect your health:
              </p>

              <div style={{
                backgroundColor: '#fff9e6',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '6px solid #ffc107',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#d17b00' }}>🌤 General Advice</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#5d4037', lineHeight: 1.6, listStyleType: 'none' }}>
                  <li>Stay indoors when AQI exceeds 150.</li>
                  <li>Close windows and use air purifiers indoors.</li>
                  <li>Drink plenty of water to minimize respiratory irritation.</li>
                  <li>Monitor the AQI forecast before planning outdoor activities.</li>
                </ul>
              </div>

              {/* Sensitive Group Advice */}
              <div style={{
                backgroundColor: '#e8f4ff',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '6px solid #2196f3',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#0b5394' }}>👨‍⚕️ Advice for Sensitive Groups</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#0d47a1', lineHeight: 1.6, listStyleType: 'none' }}>
                  <li>Asthma/COPD patients should always carry medication.</li>
                  <li>Avoid exercising outdoors during peak pollution hours.</li>
                  <li>Children, elderly, and pregnant individuals should remain indoors when AQI is poor.</li>
                  <li>Consult a doctor if symptoms like coughing or shortness of breath persist.</li>
                </ul>
              </div>

               {/* Personalized Health Advice */}
              <div style={{
                backgroundColor: '#e8f4ff',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '6px solid #578FCA',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#578FCA' }}>👨‍⚕️ Personalized Health Advice</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#333', lineHeight: 1.6, listStyleType: 'none' }}>
                  {generateHealthAdvice(aqi, profile, preferences?.threshold).map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Prompt if profile is incomplete */}
      {showPrompt && (
        <div className="profile-completion-prompt" style={{ position: 'fixed', top: '0', left: '0', width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '10px', maxWidth: '400px', textAlign: 'center' }}>
            <h3>Please complete your profile first</h3>
            <p>In order to receive personalized health recommendations, we need some more details from your profile. Please complete the required information.</p>
            <div style={{ marginTop: '20px' }}>
              <button
                onClick={() => handlePromptClose(true)}
                style={{ padding: '8px 16px', backgroundColor: '#004c9b', color: 'white', borderRadius: '6px', cursor: 'pointer' }}
              >
                Go to Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HealthRecommendationPage;
