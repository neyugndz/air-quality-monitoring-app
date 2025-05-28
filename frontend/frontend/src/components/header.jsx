import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <div className="logo">
        <Link to="/home" aria-label="Go to Dashboard">
          <img
            src="https://www.vnpt-technology.vn/front/images/logo_vnpt_technology_vn.svg"
            alt="Logo VNPT Technology"
            style={{ cursor: 'pointer' }}
          />
        </Link>
      </div>
      <div className="title">
        <span className="logo-text">Air Quality Monitoring</span>
      </div>

      <div className="account" id="account-menu">
        <i className="fas fa-user" aria-hidden="true"></i>
        <div className="dropdown-content">
          <Link to="/profile"><i className="fa-solid fa-user-ninja"></i>Profile</Link>
          <Link to="/settings"><i className="fa-solid fa-gear"></i>Settings</Link>
          <Link to="/login" className="logout"><i className="fa-solid fa-right-from-bracket"></i>Logout</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
