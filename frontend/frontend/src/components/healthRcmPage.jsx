import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './header.jsx';

function HealthRecommendationPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  return (
    <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
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

      {/* Page Content */}
      <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8' }}>
        <div style={{ padding: '24px', maxWidth: '900px', margin: ' 30px auto 40px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 'bold', color: '#253892', marginBottom: '16px' }}>
            Personalized Health Recommendations
          </h2>

          <p style={{ fontSize: '15px', color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
            Based on the current air quality index and your sensitivity profile, please follow the guidance below to protect your health:
          </p>

          {/* General Advice */}
          <div style={{
            backgroundColor: '#fff9e6',
            padding: '20px',
            borderRadius: '8px',
            borderLeft: '6px solid #ffc107',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#d17b00' }}>🌤 General Advice</h4>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#5d4037', lineHeight: 1.6 }}>
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
            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#0d47a1', lineHeight: 1.6 }}>
              <li>Asthma/COPD patients should always carry medication.</li>
              <li>Avoid exercising outdoors during peak pollution hours.</li>
              <li>Children, elderly, and pregnant individuals should remain indoors when AQI is poor.</li>
              <li>Consult a doctor if symptoms like coughing or shortness of breath persist.</li>
            </ul>
          </div>

          {/* Back Button */}
          <div style={{ textAlign: 'right', marginTop: '10px' }}>
            <Link
              to="/home"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthRecommendationPage;
