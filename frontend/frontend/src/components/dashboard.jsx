import '../css/dashboard.css';
import SensorMap from './sensorMap';
import { Link } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useEffect, useState } from 'react';
import Header from './header.jsx';
import { DeviceService } from '../service/deviceService.js';
import { TelemetryService } from '../service/telemetryService.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState(null);
  const [aqi, setAqi] = useState(null); 
  const [showAqi, setShowAqi] = useState(false);
  const [rawData, setRawData] = useState({});
  
  // Query Table Management
  const [applied, setApplied] = useState(false);
  const [pollutants, setPollutants] = useState([
    { key: 'co', label: 'CO (ppm)' },
    { key: 'no2', label: 'NO2 (ppm)' },
    { key: 'so2', label: 'SO2 (ppm)' },
    { key: 'pm25', label: 'PM 2.5 (µg/m³)' },
    { key: 'pm10', label: 'PM 10 (µg/m³)' },
    { key: 'o3', label: 'O3 (ppm)' },
  ]);

  const [checkedPollutants, setCheckedPollutants] = useState({
    co: false,
    no2: false,
    so2: false,
    pm25: false,
    pm10: false,
    o3: false,
  });

  const [date, setDate] = useState('');
  const [dataRows, setDataRows] = useState([]); 

  // For the dynamic table filtering
  const toggleCheckbox = (key) => {
    setCheckedPollutants((prev) => ({ ...prev, [key]: !prev[key] }));
  };


  /**
   * Load Device List from backend
   */
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
  useEffect(() => {
    if (!selectedDeviceId) 
      return;
    DeviceService.single(selectedDeviceId)
      .then(res => {
        setDeviceData(res.data);
      })
      .catch(err => {
        console.error('Error loading device data', err);
        setDeviceData(null);
      });
  }, [selectedDeviceId]);

  /**
   * Load latest overall AQI, Raw Pollutant and AQI of Pollutatn data from selected devices/station
   */
  useEffect(() => {
    if (!selectedDeviceId) 
      return;

    TelemetryService.singleRawDataAndAQI(selectedDeviceId)
      .then(res => {
        setAqi(res.data.overallAqi); 
        setRawData(res.data);   
      })
      .catch(err => {
        console.error('Error loading telemetry and AQI data', err);
        setAqi(null);
        setRawData(null);
      });
  }, [selectedDeviceId]);

  // Toggle between AQI and raw pollutant data
  const handleAqiToggle = () => {
    setShowAqi(prevState => !prevState); 
  };
  

  // Get the AQI category, color, icon, and advice
  const getAqiCategory = (aqi) => {
    if (aqi <= 50) {
      return { category: 'Good', backgroundColor: '#00e400', icon: '😊', advice: 'Air quality is satisfactory. You can go outside.' };
    } else if (aqi <= 100) {
      return { category: 'Average', backgroundColor: '#ffff00', icon: '😐', advice: 'Moderate air quality. Sensitive groups should limit outdoor activities.' };
    } else if (aqi <= 150) {
      return { category: 'Poor', backgroundColor: '#ff7e00', icon: '😷', advice: 'Air quality is unhealthy for sensitive groups. Limit outdoor exposure.' };
    } else if (aqi <= 200) {
      return { category: 'Bad', backgroundColor: '#ff0000', icon: '🤢', advice: 'Air quality is unhealthy. Sensitive groups should avoid going out.' };
    } else if (aqi <= 300) {
      return { category: 'Dangerous', backgroundColor: '#8f3f97', icon: '☠️', advice: 'Dangerous air quality. Avoid going outside.' };
    } else {
      return { category: 'Hazardous', backgroundColor: '#7e0023', icon: '☠️', advice: 'Very hazardous. Everyone should stay indoors.' };
    }
  };

  const { category, backgroundColor, icon, advice } = aqi ? getAqiCategory(aqi) : {};

  const toggleSidebar = () => {
    setIsSidebarOpen(prevState => !prevState);
  };

  // Query Data Management function
  const fetchData = async () => {
    try {
      // Format the date to MM-dd-yyyy with leading zeros if needed
      const dateObj = new Date(date);
      const formattedDate = `${("0" + (dateObj.getMonth() + 1)).slice(-2)}-${("0" + dateObj.getDate()).slice(-2)}-${dateObj.getFullYear()}`;
      
      // Collect selected pollutants
      const selectedPollutants = Object.keys(checkedPollutants).filter(
        (key) => checkedPollutants[key]
      );
        
      const response = await fetch(
        `http://localhost:8080/api/telemetry/historical-all/${selectedDeviceId}?date=${formattedDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('jwt_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();
      setDataRows(data);

      // Filter data for selected pollutants
      const filteredData = data.map((row) => {
        const filteredRow = {
          formattedDate: row.formattedDate,
        };
        selectedPollutants.forEach((pollutant) => {
          if (row[pollutant]) {
            filteredRow[pollutant] = row[pollutant];
          }
        });
        return filteredRow;
      });
  
      setDataRows(filteredData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  const onApply = () => {
    setApplied(true);
    fetchData();
  };


  // Percentage time of being polluted
  // Define a threshold for pollutants
  const threshold = 50; // PM2.5 or PM10 > 50 µg/m³ will be considered polluted

  // Calculate the percentage of time the air is polluted
  const calculatePollutedTime = (data) => {
    const totalData = data.length;
    const pollutedData = data.filter(row => row.pm25 > threshold || row.pm10 > threshold);
    const pollutedPercentage = (pollutedData.length / totalData) * 100;
    return pollutedPercentage;
  };

  // Use this calculation to generate data for the Pie chart
  const getPollutedTimeData = (data) => {
    const pollutedTime = calculatePollutedTime(data);

    return {
      labels: ['Polluted Time', 'Clean Time'],
      datasets: [{
        data: [pollutedTime, 100 - pollutedTime],
        backgroundColor: ['#FF0000', '#00FF00'],
        hoverBackgroundColor: ['#FF4C4C', '#4CFF4C'],
      }],
    };
  };

  // After fetching data and updating the state
  const pieData = getPollutedTimeData(dataRows); // `dataRows` contains your telemetry data

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

      <div className={`dashboard ${isSidebarOpen ? 'shifted' : ''}`} style={{ backgroundColor: '#f4f6f8' }}>
        <div className="dashboard-layout">
          {/* Left column content */}
          <div className="dashboard-left">
            {/* AQI Card Summary */}
            <div className="dashboard-card-aqi-summary" style={{ backgroundColor }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                color: 'black'
              }}>
               {/* Left: AQI Label + Icon + Number */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Air Quality Index</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      color: "#D32F2F",
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                    {icon}
                    </div>
                    <div style={{ fontSize: '40px', fontWeight: 'bold' }}>{aqi}</div>
                  </div>
                </div>

                {/* Right: Danger Label and Advice */}
                <div style={{ textAlign: 'left', lineHeight: '1.4' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{category}</div>
                  <div style={{ fontSize: '16px' }}>{advice}</div>
                </div>
              </div>
            </div>


            {/* Station Info */}
            <div className="station-info">
              <div className="station-info-left">
                <div className="station-location">
                  <i className="fas fa-map-marker-alt"></i>{' '}
                  {deviceData?.locationName || 'Loading...'}
                </div>
                <div className="station-time">
                  <i className="fas fa-clock"></i> Last updated:{' '}
                  <b>{deviceData?.lastUpdatedDate?.split(' ')[1] || '--:--'}</b> |{' '}
                  <b>{deviceData?.lastUpdatedDate?.split(' ')[0] || 'dd-mm-yyyy'}</b>
                </div>
              </div>
              <div className="station-select">
                <label htmlFor="stationDropdown" style={{ fontSize: '14px' }}>Choose station:</label>
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

            {/* Pollutant Summary */}
            <div className="raw-data-summary">
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">CO</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiCo}` : 'Loading...') : (rawData ? `${rawData.co} ppm` : 'Loading...')}
                  </div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">SO2</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiSo2}` : 'Loading...') : (rawData ? `${rawData.so2} ppm` : 'Loading...')}
                  </div>
                </div>
              </div>
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">PM2.5</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiPm25}` : 'Loading...') : (rawData ? `${rawData.pm25} µg/m³` : 'Loading...')}
                  </div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">PM10</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiPm10}` : 'Loading...') : (rawData ? `${rawData.pm10} µg/m³` : 'Loading...')}
                  </div>
                </div>
              </div>
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">O3</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiO3}` : 'Loading...') : (rawData ? `${rawData.o3} ppm` : 'Loading...')}
                  </div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">NO2</div>
                  <div className="pollutant">
                    {showAqi ? (rawData ? `${rawData.aqiNo2}` : 'Loading...') : (rawData ? `${rawData.no2} ppm` : 'Loading...')}
                  </div>
                </div>
              </div>
              <div className="aqi-link-column">
                <a href="#" style={{ textDecoration: 'none' }} onClick={handleAqiToggle}>
                  {showAqi ? 'Show Pollutant Values' : 'Show the AQI value'}
                </a>
              </div>
            </div>

            {/* TODO: Implement Polluted Time Calculation */}
            
                
          </div>

          {/* Right column: Map */}
          <div className="dashboard-map">
            <SensorMap />

            {/* Legend to show the Color coded dangers */}
            <div className="aqi-legend" style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '10px',
              marginBottom: '10px',
              padding: '10px 20px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: '#00e400', margin: '0 auto', fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>😊</div>
                <span style={{ fontSize: 13, marginTop: 4, display: 'block' }}>Good</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: '#ffff00', margin: '0 auto', fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>😐</div>
                <span style={{ fontSize: 13, marginTop: 4, display: 'block' }}>Average</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: '#ff7e00', margin: '0 auto', fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>😷</div>
                <span style={{ fontSize: 13, marginTop: 4, display: 'block' }}>Poor</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: '#ff0000', margin: '0 auto', fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>🤢</div>
                <span style={{ fontSize: 13, marginTop: 4, display: 'block' }}>Bad</span>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  backgroundColor: '#8f3f97', margin: '0 auto', fontSize: 24,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>☠️</div>
                <span style={{ fontSize: 13, marginTop: 4, display: 'block' }}>Dangerous</span>
              </div>
            </div>
          </div>

          {/* Full-width bottom section with dynamic columns */}
          <div className="dashboard-bottom" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h1 style={{ marginBottom: '20px', fontSize: '24px', color: '#8DD8FF' }}>Query measurement data</h1>

            {/* Filter Panel */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {/* Pollutant Filter */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', flexGrow: 1 }}>
                {pollutants.map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                    <input
                      type="checkbox"
                      checked={checkedPollutants[key]}
                      onChange={() => toggleCheckbox(key)}
                      style={{ cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Date Filter */}
              <div>
                <label style={{ fontSize: '14px' }} htmlFor="date-input">
                  Select Date:
                </label>
                <input
                  id="date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    fontSize: '14px',
                    padding: '6px 10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    cursor: 'pointer',
                  }}
                />
              </div>

              {/* Apply Button */}
              <button
                style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={onApply}
              >
                Apply
              </button>
            </div>

            {/* Data Table with horizontal scroll */}
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '14px',
                  color: '#444',
                }}
              >
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th
                      style={{
                        padding: '12px 10px',
                        textAlign: 'center',
                        borderBottom: '2px solid #dee2e6',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      No
                    </th>
                    <th
                      style={{
                        padding: '12px 10px',
                        textAlign: 'center',
                        borderBottom: '2px solid #dee2e6',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        padding: '12px 10px',
                        textAlign: 'center',
                        borderBottom: '2px solid #dee2e6',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      Time
                    </th>

                    {/* Dynamically render columns for each selected pollutant */}
                    {applied &&
                      pollutants.map(
                        ({ key, label }) =>
                          checkedPollutants[key] && (
                            <th
                              key={key}
                              style={{
                                padding: '12px 10px',
                                textAlign: 'center',
                                borderBottom: '2px solid #dee2e6',
                                fontWeight: '600',
                                color: '#222',
                              }}
                            >
                              {label}
                            </th>
                          )
                      )}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row, i) => (
                    <tr
                      key={i}
                      style={{
                        borderBottom: '1px solid #e9ecef',
                        backgroundColor: i % 2 === 0 ? '#f1f3f5' : 'transparent', // Alternating row color
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <td style={{ padding: '10px', textAlign: 'center' }}>{i + 1}</td>
                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {row?.formattedDate ? row?.formattedDate.split(' ')[0] : 'dd-mm-yyyy'}
                      </td>

                      <td style={{ padding: '10px', textAlign: 'center' }}>
                        {row?.formattedDate ? row?.formattedDate.split(' ')[1] : '--|--'}
                      </td>

                      {/* Dynamically render pollutant values */}
                      {applied &&
                        pollutants.map(
                          ({ key }) =>
                            checkedPollutants[key] && (
                              <td key={key} style={{ padding: '10px', textAlign: 'center' }}>
                                {row[key]}
                              </td>
                            )
                        )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
