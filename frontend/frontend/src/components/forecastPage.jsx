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
import { UserService } from '../service/userService.js';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);

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


  useEffect(() => {
    if (!selectedDeviceId) return;
  
    DeviceService.single(selectedDeviceId)
      .then(res => {
        const { stationName, overallAqi } = res.data;  // Destructure the specific attributes
        setDeviceData({
          stationName 
        });
        setAqi(overallAqi);
      })
      .catch(err => {
        console.error('Error loading device data', err);
        setDeviceData(null);
      });
  }, [selectedDeviceId]);

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
  


  // Example forecast data (replace with real data)
  const forecastLabels = {
    '24h': Array.from({ length: 24 }, (_, i) => `${i + 1}:00`),
    '3d': ['Day 1', 'Day 2', 'Day 3'],
    '7d': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  };

  const forecastValues = {
    '24h': [170, 180, 160, 160, 150, 190, 180, 175, 170, 165, 160, 158, 150, 140, 138, 130, 125, 120, 115, 110, 105, 100, 95, 90],  // Lowered values
    '3d': [210, 170, 140],  // Lowered values
    '7d': [180, 200, 160, 170, 210, 220, 150]  // Lowered values
  };


  const getAQIColor = (value) => {
    let backgroundColor, fontColor;

    if (typeof value !== 'number') {
      console.error("Invalid value for AQI: ", value); 
      return { backgroundColor: '#000000', fontColor: '#ffffff' };
    }

    if (value <= 50) {
      backgroundColor = '#00e400'; // Good
      fontColor = '#ffffff'; // White font on green background
    } else if (value <= 100) {
      backgroundColor = '#ffff00'; // Moderate
      fontColor = '#333333'; // Dark font on yellow background
    } else if (value <= 150) {
      backgroundColor = '#ff7e00'; // Poor
      fontColor = '#ffffff'; // White font on orange background
    } else if (value <= 200) {
      backgroundColor = '#ff0000'; // Bad
      fontColor = '#ffffff'; // White font on red background
    } else if (value <= 300) {
      backgroundColor = '#8f3f97'; // Dangerous
      fontColor = '#ffffff'; // White font on purple background
    } else {
      backgroundColor = '#7e0023'; // Hazardous
      fontColor = '#ffffff'; // White font on dark red background
    }

    return { backgroundColor, fontColor }; // Return both background and font color
  };


  // Define alert logic for AQI
  const checkForHealthAlerts = (forecastValues) => {
    const highAQI = forecastValues.some(value => value > aqi); 
    // Threshold-Based Alerts
    const getThresholdExceedingPercentage = (forecastValues, threshold) => {
    const countAboveThreshold = forecastValues.filter(value => value > threshold).length;
      return (countAboveThreshold / forecastValues.length) * 100;
    };

    const { backgroundColor, fontColor } = getThresholdExceedingPercentage(forecastValues, preferences?.aqiThreshold) > 50
    ? getAQIColor(Math.max(...forecastValues))  
    : { backgroundColor: '#00e400', fontColor: '#ffffff' }; 

    if (highAQI) {
      // Adjust the time frame message dynamically based on the selected forecast range
      let timeRangeMessage = '';
      if (forecastRange === '24h') {
        timeRangeMessage = 'in the next 24 hours';
      } else if (forecastRange === '3d') {
        timeRangeMessage = 'in the next 3 days';
      } else if (forecastRange === '7d') {
        timeRangeMessage = 'in the next 7 days';
      }

      return (
        <div style={{ backgroundColor: backgroundColor, padding: '12px', borderRadius: '8px', marginTop: '20px' }}>
          <h4 style={{ color: fontColor }}>Important AQI Alert</h4>
          <p style={{ color: fontColor }}>
            <strong>Warning:</strong> The AQI is expected to exceed {preferences?.aqiThreshold} {timeRangeMessage}. 
          Please take necessary precautions such as staying indoors or using air purifiers.
          </p>
        </div>
      );
    }
    return null;
  };

  // Generate lightweigth health advices for time range
  const generateHealthAdvice = (aqi, profile, threshold, forecastRange) => {
    let adviceList = [];
    
    // Prepare the time-based advice prefix
    const timeFrameAdvice = `For the ${forecastRange === '24h' ? 'next 24 hours' : forecastRange === '3d' ? 'next 3 days' : 'next 7 days'}`;
    
    // Generate health advice based on AQI levels
    if (aqi <= threshold) {
      adviceList.push(`${timeFrameAdvice}, the air quality is good (AQI: ${aqi}). You can enjoy outdoor activities.`);
    } else if (aqi <= 150) {
      adviceList.push(`${timeFrameAdvice}, the air quality is moderate (AQI: ${aqi}). Sensitive individuals should limit outdoor activities.`);
      if (profile?.asthma || profile?.respiratoryDisease) {
        adviceList.push("Consider staying indoors or using a mask.");
      }
      if (profile?.pregnant || profile?.smoker) {
        adviceList.push("Pregnant individuals and smokers should avoid outdoor exposure.");
      }
    } else if (aqi <= 200) {
      adviceList.push(`${timeFrameAdvice}, the air quality is unhealthy (AQI: ${aqi}). Stay indoors if possible.`);
      if (profile?.asthma || profile?.respiratoryDisease) {
        adviceList.push("Consider staying indoors or using a mask.");
      }
      if (profile?.pregnant || profile?.smoker) {
        adviceList.push("Pregnant individuals and smokers should avoid outdoor exposure.");
      }
    } else if (aqi <= 300) {
      adviceList.push(`${timeFrameAdvice}, the air quality is very unhealthy (AQI: ${aqi}). Avoid all outdoor activities.`);
    } else {
      adviceList.push(`${timeFrameAdvice}, the air quality is hazardous (AQI: ${aqi}). Remain indoors with windows closed.`);
    }

    return adviceList;
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
                    pointBackgroundColor: forecastValues[forecastRange].map(value => getAQIColor(value).backgroundColor)
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
          <div style={{
                backgroundColor: '#e8f4ff',
                padding: '20px',
                borderRadius: '8px',
                borderLeft: '6px solid #578FCA',
                marginTop: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <h4 style={{ marginBottom: '12px', fontSize: '17px', color: '#578FCA' }}>👨‍⚕️ Personalized Health Advice</h4>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#333', lineHeight: 1.6, listStyleType: 'none' }}>
                  {generateHealthAdvice(aqi, profile, preferences?.threshold, forecastRange).map((advice, index) => (
                    <li key={index}>{advice}</li>
                  ))}
                </ul>
              </div>
        </div>
      </div>
    </div>
  );
}

export default ForecastPage;
