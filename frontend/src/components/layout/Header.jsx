import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          <h1 className="logo-text">FinTrust<span className="ai-text">AI</span></h1>
        </Link>
        <nav className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/loan-analysis">Loan Analysis</Link>
          <Link to="/results">Results</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header; 