import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [filter]);

  const fetchData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get(`/admin/bookings?status=${filter}`)
      ]);
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchData(); // Refresh data
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <NavBar title="MechEasy Admin" />
        <div className="loading">Loading dashboard...</div>
      </>
    );
  }

  return (
    <>
      <NavBar title="MechEasy Admin" />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage bookings and monitor platform performance</p>
        </div>

        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalBookings}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-value">{stats.pendingBookings}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
          <div className="stat-card completed">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-value">{stats.completedBookings}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{formatPrice(stats.totalRevenue)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalUsers}</div>
              <div className="stat-label">Active Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛠️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalServices}</div>
              <div className="stat-label">Services</div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>All Bookings</h2>
            <div className="filter-buttons">
              <button
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button
                className={filter === 'pending' ? 'active' : ''}
                onClick={() => setFilter('pending')}
              >
                Pending
              </button>
              <button
                className={filter === 'confirmed' ? 'active' : ''}
                onClick={() => setFilter('confirmed')}
              >
                Confirmed
              </button>
              <button
                className={filter === 'in_progress' ? 'active' : ''}
                onClick={() => setFilter('in_progress')}
              >
                In Progress
              </button>
              <button
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
            </div>
          </div>

          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer</th>
                  <th>Bike</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>
                      <div className="customer-info">
                        <strong>{booking.user.name}</strong>
                        <small>{booking.user.phone}</small>
                      </div>
                    </td>
                    <td>{booking.bike.brand} {booking.bike.model}</td>
                    <td>{booking.service.name}</td>
                    <td>
                      {formatDate(booking.date)}<br/>
                      <small>{booking.timeSlot}</small>
                    </td>
                    <td>
                      <span className="type-badge">{booking.serviceType}</span>
                    </td>
                    <td>{formatPrice(booking.totalAmount)}</td>
                    <td>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="empty-state">
                <p>No bookings found for the selected filter</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
