import React from 'react';
import '../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <span className="logo-text">FinLit</span>
        </div>
      </div>
      
      <div className="navbar-right">
        <span className="user-name">Antonio Cascio</span>
        
        <div className="pwc-logo">
          <span className="pwc-text">pwc</span>
          <div className="pwc-icon">
            <div className="bar bar-1"></div>
            <div className="bar bar-2"></div>
            <div className="bar bar-3"></div>
            <div className="bar-base"></div>
          </div>
        </div>
        
        <div className="graduation-cap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-5" />
          </svg>
        </div>
        
        <div className="score-container">
          <span className="score">750</span>
          <span className="score-total">/1000</span>
        </div>
        
        <button className="logout-btn">Log out</button>
      </div>
    </nav>
  );
};

export default Navbar;
