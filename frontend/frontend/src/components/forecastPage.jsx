import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function ForecastPage() {
  const [forecastRange, setForecastRange] = useState('24h');

  const forecastLabels = {
    '24h': Array.from({ length: 24 }, (_, i) => `${i + 1}:00`),
    '3d': ['Day 1', 'Day 2', 'Day 3'],
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  const forecastValues = {
    '24h': [180, 190, 210, 220, 230, 200, 190, 185, 180, 175, 170, 168, 160, 150, 148, 140, 135, 130, 125, 120, 115, 110, 105, 100],
    '3d': [220, 180, 150],
    '7d': [190, 210, 170, 180, 220, 230, 160]
  };

  const getAQIColor = (value) => {
    if (value <= 50) return '#00e400';
    if (value <= 100) return '#ffff00';
    if (value <= 150) return '#ff7e00';
    if (value <= 200) return '#ff0000';
    if (value <= 300) return '#8f3f97';
    return '#7e0023';
  };

  return (
    <div className="home-page" style={{ backgroundColor: '#f4f6f8', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', padding: '20px', position: 'fixed', top: 0, left: 0, zIndex: 1000 }}>
        <div className="logo">
          <img
            src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
            alt="Logo VNPT Technology"
            style={{ height: '40px' }}
          />
        </div>
        <div className="title">
          <span className="logo-text" style={{ fontFamily: 'Protest Strike, sans-serif', fontSize: '1.6rem', color: '#004c9b', textTransform: 'uppercase' }}>Air Quality Monitoring</span>
        </div>
        <div className="account" id="account-menu" style={{ position: 'relative', fontSize: '30px', cursor: 'pointer' }}>
          <i className="fas fa-user" style={{ color: '#253892' }}></i>
          <div className="dropdown-content" style={{ display: 'none', position: 'absolute', right: 0, backgroundColor: '#ffffff', minWidth: '250px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)', borderRadius: '10px' }}>
            <Link to="/profile"><i className="fa-solid fa-user-ninja"></i> Account</Link>
            <Link to="/settings"><i className="fa-solid fa-gear"></i> Settings</Link>
            <Link to="/login" className="logout"><i className="fa-solid fa-right-from-bracket"></i> Logout</Link>
          </div>
        </div>
      </header>

      <div style={{ padding: '20px', maxWidth: '1000px', margin: '100px auto 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', color: '#253892' }}>Full AQI Forecast</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={forecastRange}
              onChange={(e) => setForecastRange(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', background: '#f8f9fa' }}
            >
              <option value="24h">Next 24 Hours</option>
              <option value="3d">Next 3 Days</option>
              <option value="7d">Next 7 Days</option>
            </select>
            <Link
              to="/home"
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                textDecoration: 'none'
              }}
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
          <Line
            data={{
              labels: forecastLabels[forecastRange],
              datasets: [
                {
                  label: 'Predicted AQI',
                  data: forecastValues[forecastRange],
                  borderColor: '#f44336',
                  backgroundColor: 'rgba(244, 67, 54, 0.2)',
                  tension: 0.4,
                  fill: true,
                  pointRadius: 5,
                  pointBackgroundColor: forecastValues[forecastRange].map(getAQIColor)
                }
              ]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `AQI: ${context.raw}`
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: 'Time' } },
                y: { title: { display: true, text: 'AQI Index' }, min: 0, max: 400 }
              }
            }}
          />
        </div>

        <div style={{ marginTop: '20px', backgroundColor: '#fff3cd', padding: '12px 16px', borderRadius: '8px', borderLeft: '5px solid #ffc107' }}>
          <h4 style={{ marginBottom: '8px', fontSize: '16px', color: '#856404' }}>General Health Advice</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5a4b2e' }}>
            <li>Avoid outdoor activities if AQI is above 150.</li>
            <li>Use air purifiers indoors and keep windows closed.</li>
            <li>People with respiratory conditions should follow doctor’s advice.</li>
          </ul>
          <Link
            to="/health-recommendations"
            style={{
              display: 'inline-block',
              marginTop: '16px',
              backgroundColor: '#ff9800',
              color: 'white',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              textDecoration: 'none'
            }}
          >
            View Full Health Recommendations →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ForecastPage;
