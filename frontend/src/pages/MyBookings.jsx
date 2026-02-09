import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings');
      setBookings(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      in_progress: '#9c27b0',
      completed: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      in_progress: '🔧',
      completed: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <>
        <NavBar title="MechEasy" />
        <div className="page-container">
          <div className="loading">Loading bookings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="bookings-page">
        <div className="page-header">
          <h1>My Bookings</h1>
          <p>Track your service appointments</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>No Bookings Yet</h2>
            <p>You haven't made any service bookings</p>
            <a href="/book-service" className="btn-primary">
              Book Your First Service
            </a>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <div className="status-badge" style={{ background: getStatusColor(booking.status) }}>
                    <span>{getStatusIcon(booking.status)}</span>
                    <span>{booking.status.replace('_', ' ')}</span>
                  </div>
                  <div className="booking-id">#{booking.id}</div>
                </div>

                <div className="booking-content">
                  <div className="booking-info">
                    <div className="info-row">
                      <span className="label">🏍️ Bike:</span>
                      <span className="value">{booking.bike.brand} {booking.bike.model} ({booking.bike.numberPlate})</span>
                    </div>
                    <div className="info-row">
                      <span className="label">🛠️ Service:</span>
                      <span className="value">{booking.service.name}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📅 Date:</span>
                      <span className="value">{formatDate(booking.date)}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">⏰ Time:</span>
                      <span className="value">{booking.timeSlot}</span>
                    </div>
                    <div className="info-row">
                      <span className="label">📍 Type:</span>
                      <span className="value">{booking.serviceType === 'visit' ? 'Visit Center' : booking.serviceType === 'pickup' ? 'Pickup & Drop' : 'Home Service'}</span>
                    </div>
                    {booking.address && (
                      <div className="info-row">
                        <span className="label">🏠 Address:</span>
                        <span className="value">{booking.address}</span>
                      </div>
                    )}
                    <div className="info-row total">
                      <span className="label">💰 Total Amount:</span>
                      <span className="value">{formatPrice(booking.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="booking-actions">
                    {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        Cancel Booking
                      </button>
                    )}
                    {booking.payment && (
                      <div className="payment-status">
                        Payment: <strong>{booking.payment.status}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default MyBookings;
