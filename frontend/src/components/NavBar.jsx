import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import icon from '../assets/icon.png'
import { useAuth } from '../context/AuthContext'
//css for navbar  
import './css/NavBar.css'

const NavBar = (props) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={icon} alt="title-icon.png" className="navbar-icon"/>
        <h1 className='navbar-title'>{props.title}</h1>
      </Link>
      
      <div className="navbar-menu">
        {isAuthenticated() ? (
          <>
            <span className="navbar-user">Welcome, {user?.name}</span>
            <Link to="/dashboard" className="navbar-link">Dashboard</Link>
            <button onClick={handleLogout} className="navbar-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">Login</Link>
            <Link to="/register" className="navbar-btn">Get Started</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default NavBar