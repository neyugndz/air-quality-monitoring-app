import '../css/home.css';
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
        <div className='dashboard-grid'>
          <div className='dashboard-card-aqi-summary'>
            <div className='aqi-top-bar'>
              <span>Air Quality Index</span>
              <div className='aqi-status'>Bad</div>
              <div className='aqi-warning'>The sensitive one shouldn't go outside. The others shouldn't stay outside for too long</div>
              <div className='aqi-value'>
                <span className="aqi-icon">😷</span>
                <span className="aqi-number">212</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
