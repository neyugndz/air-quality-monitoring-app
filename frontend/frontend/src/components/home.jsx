import '../css/home.css';
import SensorMap from './sensorMap';
import { Link } from "react-router-dom";

function Home() {

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
          </div>

          {/* Right column: Map */}
          <div className="dashboard-map">
            <SensorMap />
          </div>

          {/* Full-width bottom section (table/chart/filter) */}
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

export default Home;
