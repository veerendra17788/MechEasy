import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const dashboardCards = [
    {
      title: 'My Bikes',
      description: 'View and manage your registered bikes',
      icon: '🏍️',
      path: '/bikes',
      color: '#667eea'
    },
    {
      title: 'Book Service',
      description: 'Schedule a new service appointment',
      icon: '📅',
      path: '/book-service',
      color: '#764ba2'
    },
    {
      title: 'My Bookings',
      description: 'View your service history and status',
      icon: '📋',
      path: '/bookings',
      color: '#f093fb'
    },
    {
      title: 'Services',
      description: 'Browse available services and pricing',
      icon: '🛠️',
      path: '/services',
      color: '#4facfe'
    }
  ];

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Manage your bikes and service appointments</p>
        </div>

        <div className="dashboard-grid">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              className="dashboard-card"
              onClick={() => navigate(card.path)}
              style={{ borderTop: `4px solid ${card.color}` }}
            >
              <div className="card-icon" style={{ background: `${card.color}20` }}>
                <span style={{ color: card.color }}>{card.icon}</span>
              </div>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <button className="card-button" style={{ color: card.color }}>
                View →
              </button>
            </div>
          ))}
        </div>

        <div className="quick-stats">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Total Bikes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Active Bookings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">0</div>
              <div className="stat-label">Completed Services</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
