import '../css/dashboard.css';
import SensorMap from './sensorMap';
import { Link } from "react-router-dom";
import { Bar, Line } from 'react-chartjs-2';
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
import axios from 'axios';
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
  const [selectedPollutant, setSelectedPollutant] = useState('CO');
  const [timeFormat, setTimeFormat] = useState('Tháng');
  const [timeValue, setTimeValue] = useState('2025-03');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [deviceData, setDeviceData] = useState(null);
  const [aqi, setAqi] = useState(null); 
  const [showAqi, setShowAqi] = useState(false);
  const [rawData, setRawData] = useState({});

  const currentAQI = 22;

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

  // For the dynamic table filtering
  const pollutants = [
    { key: 'co', label: 'CO (ppm)' },
    { key: 'no2', label: 'NO2 (ppm)' },
    { key: 'so2', label: 'SO2 (ppm)' },
    { key: 'o3', label: 'O3 (ppm)' },
    { key: 'pm25', label: 'PM 2.5 (µg/m³)' },
    { key: 'pm10', label: 'PM 10 (µg/m³)' }
  ];

  const initialCheckedState = pollutants.reduce((acc, p) => {
    acc[p.key] = true;
    return acc;
  }, {});

  const [checkedPollutants, setCheckedPollutants] = useState(initialCheckedState);
  const [applied, setApplied] = useState(false);

  const toggleCheckbox = (key) => {
    setCheckedPollutants(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const onApply = () => {
    setApplied(true);
  };

  // Sample data for the table
  const dataRows = [
    { date: '20/3/2025', time: '10:04', co: 128, no2: 67, so2: 12, o3: 32, pm25: 294, pm10: 180 },
    { date: '20/3/2025', time: '10:03', co: 241, no2: 76, so2: 14, o3: 31, pm25: 193, pm10: 231 },
    { date: '20/3/2025', time: '10:03', co: 159, no2: 61, so2: 8, o3: 37, pm25: 251, pm10: 224 },
    { date: '20/3/2025', time: '10:02', co: 105, no2: 75, so2: 11, o3: 74, pm25: 258, pm10: 196 },
  ];

  const pollutantOptions = {
    CO: {
      label: 'CO (ppm)',
      data: [128, 130, 125, 140, 120, 110, 128],
      unit: 'ppm'
    },
    SO2: {
      label: 'SO2 (ppm)',
      data: [12, 10, 11, 14, 9, 13, 12],
      unit: 'ppm'
    },
    PM25: {
      label: 'PM2.5 (µg/m³)',
      data: [294, 250, 260, 245, 270, 280, 294],
      unit: 'µg/m³'
    },
    PM10: {
      label: 'PM10 (µg/m³)',
      data: [180, 172, 185, 190, 200, 198, 180],
      unit: 'µg/m³'
    },
    O3: {
      label: 'O₃ (ppm)',
      data: [32, 34, 30, 36, 33, 29, 32],
      unit: 'ppm'
    },
    NO2: {
      label: 'NO₂ (ppm)',
      data: [67, 70, 72, 68, 66, 65, 67],
      unit: 'ppm'
    }
  };

  return (
    <div className="home-page">
      <Header toggleSidebar={toggleSidebar}/>

       {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ul>
          <li><Link to="/home">Dashboard</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          {/* Add more links if needed */}
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

            {/* Health Recommendation Summary */}
            <div 
              style={{
                backgroundColor: '#fff8e1',
                borderLeft: '5px solid #ffc107',
                padding: '16px 20px',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                minHeight: '240px',  // approximate height to match forecast side
                boxSizing: 'border-box',  
              }}>
              <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', color: '#e65100' }}>Health Recommendations</h4>
               <ul style={{ paddingLeft: '20px', fontSize: '14px', margin: 0, color: '#4e342e', lineHeight: 1.6 }}>
                <li>If you have asthma or heart disease, avoid outdoor activity.</li>
                <li>Children and the elderly should stay indoors.</li>
                <li>Wear an N95 mask when going outside.</li>
                <li>Keep windows closed and use an air purifier if possible.</li>
                <li>Avoid outdoor exercise during peak pollution hours.</li>
                <li>Increase indoor ventilation when outdoor air quality improves.</li>
                <li>Use saline nasal spray to reduce irritation caused by pollutants.</li>
                <li>Consult your doctor if you experience symptoms like coughing or wheezing.</li>
                <li>Stay hydrated to help your body cope with air pollution effects.</li>
              </ul>
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <Link 
                  to='/health-recommendations'
                  style={{
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}>
                  View Full Guide
                </Link>
              </div>
            </div>


            {/* Chart for Trend Analysis */}
            <CollapsiblePanel
              title="Trend Analysis"
              isOpenDefault={false}
              >
              <div className="chart-statistics" style={{ backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>

                {/* Header: Title on the left, selectors on the right */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {/* Pollutant Selector */}
                    <select
                      value={selectedPollutant}
                      onChange={(e) => setSelectedPollutant(e.target.value)}
                      style={{
                        fontSize: '14px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                      }}
                    >
                      {Object.keys(pollutantOptions).map((key) => (
                        <option key={key} value={key}>{pollutantOptions[key].label}</option>
                      ))}
                    </select>

                    {/* Time Format Selector */}
                    <select
                      value={timeFormat}
                      onChange={(e) => {
                        setTimeFormat(e.target.value);
                        // Reset time value when format changes
                        if (e.target.value === 'Day') setTimeValue('2025-03-20');
                        else if (e.target.value === 'Month') setTimeValue('2025-03');
                        else if (e.target.value === 'Year') setTimeValue('2025');
                        else setTimeValue('2025-W12');
                      }}
                      style={{
                        fontSize: '14px',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        backgroundColor: '#f8f9fa',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Day">Day</option>
                      <option value="Week">Week</option>
                      <option value="Month">Month</option>
                      <option value="Year">Year</option>
                    </select>

                    {/* Time Value Input (dynamic) */}
                    {timeFormat === 'Day' && (
                      <input
                        type="date"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        style={{
                          fontSize: '14px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    )}
                    {timeFormat === 'Week' && (
                      <input
                        type="week"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        style={{
                          fontSize: '14px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    )}
                    {timeFormat === 'Month' && (
                      <input
                        type="month"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        style={{
                          fontSize: '14px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    )}
                    {timeFormat === 'Year' && (
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        value={timeValue}
                        onChange={(e) => setTimeValue(e.target.value)}
                        style={{
                          fontSize: '14px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #ccc',
                          width: '100px',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Line Chart */}
                <Line
                  data={{
                    labels: ['01', '05', '10', '15', '20', '25', '30'],
                    datasets: [
                      {
                        label: pollutantOptions[selectedPollutant].label,
                        data: pollutantOptions[selectedPollutant].data,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        fill: true,
                        tension: 0.4,
                        pointRadius: 4,
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      title: {
                        display: true,
                        text: `Statistics of ${pollutantOptions[selectedPollutant].label} (${timeFormat} ${timeValue})`
                      },
                      legend: {
                        display: false,
                      }
                    },
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: 'Time'
                        }
                      },
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: `Value (${pollutantOptions[selectedPollutant].unit})`
                        }
                      }
                    }
                  }}
                />
              </div>
            </CollapsiblePanel>
            
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



            {/* Chart for AQI Forecast */}
            <CollapsiblePanel
              title="AQI Forecast - Station Info"
              isOpenDefault={false}
            >
              <div className="chart-forecast" style={{ marginTop: "10px", backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>

                {/* Header: Title on the left, time range selector on the right */}
                {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}> */}
                  {/* <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>AQI Forecast - Cau Giay Station</h3> */}

                  {/* <select
                    value={forecastRange}
                    onChange={(e) => setForecastRange(e.target.value)}
                    style={{
                      fontSize: '14px',
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      backgroundColor: '#f8f9fa',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="6h">Next 6 hours</option>
                    <option value="24h">Next 24 hours</option>
                    <option value="7d">Next 7 days</option>
                  </select>
                </div> */}

                {/* Line Chart */}
                <Line
                  data={{
                    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'], // replace later based on forecastRange
                    datasets: [
                      {
                        label: 'Predicted AQI',
                        data: [212, 215, 218, 220, 219, 217], // replace later
                        borderColor: '#f44336',
                        backgroundColor: 'rgba(244, 67, 54, 0.2)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 5,
                        pointBackgroundColor: (ctx) => {
                          const value = ctx.raw;
                          if (value <= 50) return '#00e400';
                          if (value <= 100) return '#ffff00';
                          if (value <= 150) return '#ff7e00';
                          if (value <= 200) return '#ff0000';
                          if (value <= 300) return '#8f3f97';
                          return '#7e0023';
                        }
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      title: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            const aqi = context.raw;
                            const risk =
                              aqi <= 50 ? "Good" :
                              aqi <= 100 ? "Moderate" :
                              aqi <= 150 ? "Unhealthy for Sensitive Groups" :
                              aqi <= 200 ? "Unhealthy" :
                              aqi <= 300 ? "Very Unhealthy" : "Hazardous";
                            return `AQI: ${aqi} - ${risk}`;
                          }
                        }
                      }
                    },
                    scales: {
                      x: {
                        title: { display: true, text: 'Time (hour)' }
                      },
                      y: {
                        beginAtZero: false,
                        min: 0,
                        max: 400,
                        title: { display: true, text: 'AQI' }
                      }
                    }
                  }}
                />

                {currentAQI > 150 && (
                <>
                  <div style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    backgroundColor: '#fdecea',
                    padding: '10px',
                    borderRadius: '6px',
                    borderLeft: '4px solid #f44336',
                    color: '#b71c1c'
                  }}>
                    ⚠️ Unhealthy air quality. Sensitive groups should stay indoors. Others should reduce outdoor activity.
                  </div>
                  </>
                )}

                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <Link
                      to="/forecast"
                      style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}>
                      View Full Forecast & Health Advice
                    </Link>
                  </div>
              </div>
            </CollapsiblePanel>
          </div>

          {/* Full-width bottom section with dynamic columns */}
          <div className="dashboard-bottom" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
            <h1 style={{marginBottom: '20px', fontSize: '24px', color: '#8DD8FF' }}>Query measurement data</h1>

            {/* Filter Panel */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              {/* Checkbox Group */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '20px',
                  flexGrow: 1,
                  minWidth: '300px',
                  justifyContent: 'center',
                }}
              >
                {pollutants.map(({ key, label }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px',
                      userSelect: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
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

              {/* Control Panel */}
              <div
                style={{
                  display: 'flex',
                  gap: '15px',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  minWidth: '320px',
                }}
              >
                <label
                  style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: '500' }}
                  htmlFor="index-select"
                >
                  Select the index
                </label>
                <select
                  id="index-select"
                  style={{
                    height: '34px',
                    fontSize: '14px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    padding: '0 10px',
                    minWidth: '130px',
                    cursor: 'pointer',
                  }}
                >
                  <option value="custom">Custom</option>
                </select>

                <label
                  style={{ fontSize: '14px', whiteSpace: 'nowrap', fontWeight: '500' }}
                  htmlFor="date-input"
                >
                  Time
                </label>
                <input
                  id="date-input"
                  type="date"
                  defaultValue="2025-03-20"
                  style={{
                    height: '34px',
                    fontSize: '14px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    padding: '0 10px',
                    minWidth: '140px',
                    cursor: 'pointer',
                  }}
                />

                <button
                  style={{
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.3s ease',
                    whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                  onClick={() => setApplied(true)}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Data Table with horizontal scroll */}
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  minWidth: '950px',
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
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        whiteSpace: 'nowrap',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      STT
                    </th>
                    <th
                      style={{
                        padding: '12px 10px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        whiteSpace: 'nowrap',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      Ngày
                    </th>
                    <th
                      style={{
                        padding: '12px 10px',
                        textAlign: 'left',
                        borderBottom: '2px solid #dee2e6',
                        whiteSpace: 'nowrap',
                        fontWeight: '600',
                        color: '#222',
                      }}
                    >
                      Giờ
                    </th>

                    {/* Dynamically render columns if applied */}
                    {applied && pollutants.map(({ key, label }) =>
                      checkedPollutants[key] && (
                        <th
                          key={key}
                          style={{
                            padding: '12px 10px',
                            textAlign: 'left',
                            borderBottom: '2px solid #dee2e6',
                            whiteSpace: 'nowrap',
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
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f3f5')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ padding: '10px 8px' }}>{i + 1}</td>
                      <td style={{ padding: '10px 8px' }}>{row.date}</td>
                      <td style={{ padding: '10px 8px' }}>{row.time}</td>

                      {applied && pollutants.map(({ key }) =>
                        checkedPollutants[key] ? (
                          <td key={key} style={{ padding: '10px 8px' }}>
                            {row[key]}
                          </td>
                        ) : null
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


// Collapsible Component for shorten the charts
function CollapsiblePanel ({title, children, isOpenDefault = false}) {
  const[isOpen, setIsOpen] = useState(isOpenDefault);
  return(
  <div style={{ marginBottom: '20px', backgroundColor: 'white', borderRadius: '8px', padding: '16px' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: 'pointer',
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 'none',
          padding: '10px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: '#007bff',
          borderBottom: 'none',
          outline: 'none',
          userSelect: 'none'
        }}
      >
        {isOpen ? '▼ ' : '▶ '} {title}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

export default Dashboard;
