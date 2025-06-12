import React, { useEffect, useState } from 'react';
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
import Header from './header.jsx';
import { DeviceService } from '../service/deviceService.js';

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

function ForecastPage({ profile, preferences }) {
  const [forecastRange, setForecastRange] = useState('24h');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  useEffect(() => {
      DeviceService.index()
          .then(res => {
          setDevices(res.data);
          if(res.data.length > 0) {
              setSelectedDeviceId(res.data[0]?.deviceId);
          }
          })
          .catch(err => console.error("Error loading devices ", err));
  }, []);

   /**
   * Load telemetry in DTO format of selected devices
   */
  //  useEffect(() => {
  //   if (!selectedDeviceId) 
  //     return;
  //   DeviceService.single(selectedDeviceId)
  //     .then(res => {
  //       setDeviceData(res.data);
  //     })
  //     .catch(err => {
  //       console.error('Error loading device data', err);
  //       setDeviceData(null);
  //     });
  // }, [selectedDeviceId]);


  useEffect(() => {
    if (!selectedDeviceId) return;
  
    DeviceService.single(selectedDeviceId)
      .then(res => {
        const { stationName } = res.data;  // Destructure the specific attributes
        setDeviceData({
          stationName 
        });
      })
      .catch(err => {
        console.error('Error loading device data', err);
        setDeviceData(null);
      });
  }, [selectedDeviceId]);
  


  // Example forecast data (replace with real data)
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
    if (value <= 50) return '#00e400'; // Good
    if (value <= 100) return '#ffff00'; // Moderate
    if (value <= 150) return '#ff7e00'; // Poor
    if (value <= 200) return '#ff0000'; // Bad
    if (value <= 300) return '#8f3f97'; // Dangerous
    return '#7e0023'; // Hazardous
  };

  // Define alert logic for AQI
  const checkForHealthAlerts = (forecastValues) => {
    const highAQI = forecastValues.some(value => value > 150); // If AQI is above 150
    if (highAQI) {
      return (
        <div style={{ backgroundColor: '#ffeb3b', padding: '12px', borderRadius: '8px', marginTop: '20px' }}>
          <h4 style={{ color: '#856404' }}>Important AQI Alert</h4>
          <p style={{ color: '#5a4b2e' }}>
            <strong>Warning:</strong> The AQI is expected to exceed 150 in the next 24 hours. Please take necessary precautions such as staying indoors or using air purifiers.
          </p>
        </div>
      );
    }
    return null;
  };

  // Display personalized health advice based on forecast and user health profile
  const healthAdvice = () => {
    const asthmaAlert = profile?.asthma === 'Yes' ? 'People with asthma should stay indoors and use their inhalers if AQI exceeds 150.' : '';
    const pregnancyAlert = profile?.pregnant === 'Yes' ? 'Pregnant women should avoid outdoor activities in high AQI levels.' : '';
    return (
      <div style={{ backgroundColor: '#fff3cd', padding: '12px 16px', borderRadius: '8px', marginTop: '20px' }}>
        <h4 style={{ color: '#856404' }}>Personalized Health Advice</h4>
        <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#5a4b2e' }}>
          <li>Avoid outdoor activities if AQI exceeds 150.</li>
          <li>{asthmaAlert}</li>
          <li>{pregnancyAlert}</li>
        </ul>
        <Link
          to="/health-recommendations"
          style={{
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
    );
  };

  return (
    <div className="home-page" style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
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

      <div className={`page ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8' }}>
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '20px auto 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '24px', color: '#253892' }}>Air Quality Forecast</h2>
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
              <div className="station-select">
                <label htmlFor="stationDropdown" style={{ fontSize: '16px' }}>Select station:</label>
                <select
                    id="stationDropdown"
                    value={selectedDeviceId}
                    onChange={(e) => setSelectedDeviceId(e.target.value)}
                    style={{
                        fontSize: '14px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                    }}
                >
                    {devices.map((device) => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.stationName}
                        </option>
                    ))}
                </select>
            </div>
            </div>
          </div>

          {/* AQI Forecast Chart */}
          <div style={{ background: 'white', padding: '1rem', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '20px', color: '#253892', marginBottom: '12px' }}>
              {`AQI Forecast for ${deviceData?.stationName || 'Unknown '} Station (${forecastRange === '24h' ? 'Next 24 Hours' : forecastRange === '3d' ? 'Next 3 Days' : 'Next 7 Days'})`}
            </h3>
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

          {/* Alerts and Health Advice */}
          {checkForHealthAlerts(forecastValues[forecastRange])}
          {healthAdvice()}
        </div>
      </div>
    </div>
  );
}

export default ForecastPage;
