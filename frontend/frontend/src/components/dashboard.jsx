import '../css/dashboard.css';
import SensorMap from './sensorMap';
import { Link } from "react-router-dom";
import { Bar } from 'react-chartjs-2';  // Import Bar chart component from Chart.js
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


function Dashboard() {

  const [chartData, setChartData] = useState({
    labels: ['CO', 'SO2', 'PM2.5', 'PM10', 'O3', 'NO2'],
    datasets: [
      {
        label: 'Pollutant Concentration',
        data: [50, 40, 266, 100, 75, 85],  // AQI values or pollutant concentrations here
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
      }
    ]
  });

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
              <div className="aqi-top-bar">
                <span>Air Quality Index</span>
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
                <span>Choose the station</span> <i className="fas fa-chevron-down"></i>
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
                  <a href="#">Show the AQI value</a>
                </div>
            </div>

            {/* Chart for Real-time Raw Data*/}
            <div id="chart-container" style={{ marginTop: "20px", backgroundColor: "white", padding: "1rem", borderRadius: "8px" }}>
              <Bar 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: { position: 'top' },
                    title: {
                      display: true,
                      text: 'Pollutant Concentrations (AQI)',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'AQI Value'
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Chart For trend Analysis */}

            {/* Chart or something else to display the Forecast of the AQI value */}

          </div>

          {/* Right column: Map */}
          <div className="dashboard-map">
            <SensorMap />

            {/* Color Coded Legend to make sense for the Map */}
            {/* Chart for Percantage time pollution per days */}
          </div>


          {/* Full-width bottom section (Chart for View Historical data) */}
          <div className="dashboard-bottom">
            {/* Example content */}
            <h4>Truy vấn dữ liệu đo</h4>
            {/* ... put your filters, chart, or table here ... */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
