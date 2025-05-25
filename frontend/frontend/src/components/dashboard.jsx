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
import { useState } from 'react';

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
  const [forecastRange, setForecastRange] = useState('6h')

  const currentAQI = 212;
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


  const statisticsData = {
    labels: ['01', '05', '10', '15', '20', '25', '30'],
    datasets: [
      {
        label: 'CO (ppm)',
        data: [128, 130, 125, 140, 120, 110, 128],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.3,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const forecastData = {
    labels: ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
    datasets: [
      {
        label: 'Dự báo AQI',
        data: [212, 215, 218, 220, 219, 217],
        fill: true,
        backgroundColor: 'rgba(255, 159, 64, 0.2)',
        borderColor: 'rgba(255, 159, 64, 1)',
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="home-page">
      <header>
        <div className="logo">
          <img
            src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
            alt="Logo VNPT Technology"
          />
        </div>
        <div className="title">
          <span className="logo-text">Air Quality Monitoring</span>
        </div>

        <div className="account" id="account-menu">
          <i className="fas fa-user"></i>
          <div className="dropdown-content">
            <Link to="/profile"><i className="fa-solid fa-user-ninja"></i>Account</Link>
            <Link to="/settings"><i className="fa-solid fa-gear"></i>Settings</Link>
            <Link to="/login" className="logout"><i className="fa-solid fa-right-from-bracket"></i>Logout</Link>
          </div>
        </div>
      </header>

      <div className="dashboard" style={{ backgroundColor: '#f4f6f8' }}>
        <div className="dashboard-layout">
          {/* Left column content */}
          <div className="dashboard-left">
            {/* AQI Card Summary */}
            <div className="dashboard-card-aqi-summary">
              <div style={{
                display: 'flex',
                justifyContent: 'space-evenly',
                alignItems: 'center',
                color: 'white'
              }}>
               {/* Left: AQI Label + Icon + Number */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Air Quality Index</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      color: '#d32f2f',
                      width: '50px',
                      height: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px'
                    }}>
                    🤢
                    </div>
                    <div style={{ fontSize: '40px', fontWeight: 'bold' }}>212</div>
                  </div>
                </div>

                {/* Right: Danger Label and Advice */}
                <div style={{ textAlign: 'left', lineHeight: '1.4' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Bad</div>
                  <div style={{ fontSize: '16px' }}>Sensitive groups should avoid going out. Others should limit going out.</div>
                </div>
              </div>
            </div>


            {/* Station Info */}
            <div className="station-info">
              <div className="station-info-left">
                <div className="station-location">
                  <i className="fas fa-map-marker-alt"></i> 124 Hoang Quoc Viet
                </div>
                <div className="station-time">
                  <i className="fas fa-clock"></i> Last updated: <b>10:04</b> | <b>20/03/2025</b>
                </div>
              </div>
              <div className="station-select">
                <label htmlFor="stationDropdown" style={{ fontSize: '14px', marginRight: '6px' }}>Choose station:</label>
                <select
                  id="stationDropdown"
                  style={{
                    fontSize: '14px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ccc',
                    backgroundColor: '#f8f9fa',
                    cursor: 'pointer'
                  }}
                >
                  <option value="cg">Cau Giay Station</option>
                  <option value="bth">Ba Dinh Station</option>
                  <option value="tx">Thanh Xuan Station</option>
                </select>
              </div>
            </div>

            {/* Pollutant Summary */}
            <div className="raw-data-summary">
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">CO</div>
                  <div className="pollutant">128 ppm</div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">SO2</div>
                  <div className="pollutant">12 ppm</div>
                </div>
              </div>
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">PM2.5</div>
                  <div className="pollutant">294 µg/m³</div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">PM10</div>
                  <div className="pollutant">180 µg/m³</div>
                </div>
              </div>
              <div className="pollutant-value-container">
                <div className="pollutant-value">
                  <div className="pollutant">O3</div>
                  <div className="pollutant">32 ppm</div>
                </div>
                <div className="pollutant-value">
                  <div className="pollutant">NO2</div>
                  <div className="pollutant">67 ppm</div>
                </div>
              </div>
              <div className="aqi-link-column">
                <a href="#" style={{textDecoration: 'none'}}>Show the AQI value</a>
              </div>
            </div>

            {/* Health Recommendation Summary */}
            <div style={{
              backgroundColor: '#fff8e1',
              borderLeft: '5px solid #ffc107',
              padding: '12px 16px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '16px', color: '#e65100' }}>Health Recommendations</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '13px', margin: 0, color: '#4e342e' }}>
                <li>If you have asthma or heart disease, avoid outdoor activity.</li>
                <li>Children and the elderly should stay indoors.</li>
                <li>Wear an N95 mask when going outside.</li>
                <li>Keep windows closed and use an air purifier if possible.</li>
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
                <h1 style={{ margin: 0, fontSize: '24px', color: '#8DD8FF' }}>Trend Analysis</h1>

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
            
          </div>

          {/* Right column: Map */}
          <div className="dashboard-map">
            <SensorMap />

            {/* Legend to show the Color coded dangers */}
            <div className="aqi-legend" style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: '10px',
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
            <div className="chart-forecast" style={{ marginTop: "10px", backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>

              {/* Header: Title on the left, time range selector on the right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#333' }}>AQI Forecast - Cau Giay Station</h3>

                <select
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
              </div>

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
              </>
              )}
            </div>
          </div>

          {/* Full-width bottom section */}
          <div className="dashboard-bottom">
            <h4 style={{ color: '#007bff', fontSize: '16px', fontWeight: 600 }}>Truy vấn dữ liệu đo</h4>

            {/* Filter Panel */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {['Nhiệt độ', 'Độ ẩm', 'Áp suất', 'CO', 'NO2', 'SO2', 'O3', 'PM 2.5', 'PM 10'].map((label, index) => (
                  <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}>
                    <input type="checkbox" defaultChecked />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ fontSize: '13px' }}>Lựa chọn chỉ số</label>
                <select style={{ height: '30px', fontSize: '13px' }}>
                  <option value="custom">Tùy chỉnh</option>
                </select>
                <label style={{ fontSize: '13px' }}>Thời gian</label>
                <input type="date" defaultValue="2025-03-20" style={{ height: '30px', fontSize: '13px' }} />
                <button style={{
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '4px 12px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}>Thực hiện</button>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead style={{ backgroundColor: '#f5f5f5' }}>
                  <tr>
                    {['STT', 'Ngày', 'Giờ', 'Nhiệt độ (°C)', 'Độ ẩm (%)', 'Áp suất (pa)', 'CO (ppm)', 'NO2 (ppm)', 'SO2 (ppm)', 'O3 (ppm)', 'PM 2.5 (µg/m³)', 'PM 10 (µg/m³)'].map((header, i) => (
                      <th key={i} style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ccc' }}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '20/3/2025', time: '10:04', temp: 49, humid: 54, pressure: 648, co: 128, no2: 67, so2: 12, o3: 32, pm25: 294, pm10: 180 },
                    { date: '20/3/2025', time: '10:03', temp: 50, humid: 41, pressure: 822, co: 241, no2: 76, so2: 14, o3: 31, pm25: 193, pm10: 231 },
                    { date: '20/3/2025', time: '10:03', temp: 43, humid: 42, pressure: 374, co: 159, no2: 61, so2: 8, o3: 37, pm25: 251, pm10: 224 },
                    { date: '20/3/2025', time: '10:02', temp: 45, humid: 45, pressure: 819, co: 105, no2: 75, so2: 11, o3: 74, pm25: 258, pm10: 196 }
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{i + 1}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.date}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.time}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.temp}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.humid}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.pressure}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.co}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.no2}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.so2}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.o3}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.pm25}</td>
                      <td style={{ padding: '6px', borderBottom: '1px solid #eee' }}>{row.pm10}</td>
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
