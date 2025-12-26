import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">PhD Research</span>
              <span className="logo-subtitle">Cloud Load Balancing</span>
            </div>
          </div>
          <nav className="nav-menu">
            <a href="#phases" className="nav-link">Research Phases</a>
            <a href="#overview" className="nav-link">Overview</a>
            <a href="#contact" className="nav-link">Contact</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

