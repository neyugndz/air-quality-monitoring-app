import React, { useRef, useState } from "react";
import '../css/home.css';
import { Link } from "react-router-dom";
import MyDay from "./MyDay";
import Important from "./Important";
import Planned from "./Planned";
import AllTasks from "./AllTasks";

function Home() {
  // Create a reference for navbar
  const navRef = useRef(null);
  const [isShifted, setIsShifted] = useState(false);
  const [content, setContent] = useState("");


  // Mapping of content to different background color
  const backgroundColorContent = {
    'My Day': '#e6f1f8',
    'Important': '#ffebee',
    'Planned': '#d8f9da',
    'Tasks': '#3697c6'
  };

  const backgroundColor = backgroundColorContent[content] || '#e6f1f8';

  const toggleNavBar = () => {
    if (navRef.current) {
      navRef.current.classList.toggle('show');
      setIsShifted((prevIsShifted) => !prevIsShifted);
    }
  };

  // Switch content of the main-content page
  const renderContentPage = () => {
    switch (content) {
      case 'My Day':
        return <MyDay />;
      case 'Important':
        return <Important />;
      case 'Planned':
        return <Planned/>;
      case 'Tasks':
        return <AllTasks/>;
      default:
        return <MyDay />;
    }
  };

  return (
    <div className="home-page">
      <header>
        <div className="menu-icon" id="menu-icon" onClick={toggleNavBar}>
          <i className="fas fa-bars"></i>
        </div>

        <div className="logo">
          <img 
            src="/Logo-Truong-Dai-hoc-Khoa-hoc-va-Cong-nghe-Ha-Noi.png" 
            alt="Logo-Truong-Dai-hoc-Khoa-hoc-va-Cong-nghe-Ha-Noi" 
          />
          <span>Task Management</span>
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

      <div className="navbar" ref={navRef}>
        <div className="search-container">
          <input 
            type="text"
            placeholder="Search"
            className="search-bar"
          />
          <i className="fa-solid fa-magnifying-glass search-icon"></i>  
        </div>

        <div className="nav-links">
          <Link to="#" id='my-day-section' onClick={() => { setContent('My Day') }}>
            <i className="fa-regular fa-sun"></i>My Day
          </Link>
          <Link to="#" id='important-section' onClick={() => { setContent('Important') }}>
            <i className="fa-regular fa-star"></i>Important
          </Link>
          <Link to="#" id='planned-section' onClick={() => { setContent('Planned') }}>
            <i className="fa-solid fa-pen"></i>Planned
          </Link>
          <Link to="#" id='tasks-section' onClick={() => { setContent('Tasks') }}>
            <i className="fa-solid fa-house"></i>Tasks
          </Link>
        </div>

        <div className="divider-line"></div>
        
        <div className="new-section">
          <Link to="#" data-target="new-list"><i className="fas fa-plus"></i>New list</Link>
          <Link to="#" data-target="new-group"><i className="fas fa-copy"></i>New Group</Link>
        </div>
      </div>

      <div className={`content ${isShifted ? 'shift-right' : ''}`} style={{backgroundColor}}>
        {renderContentPage()}
      </div>
    </div>
  );
}

export default Home;