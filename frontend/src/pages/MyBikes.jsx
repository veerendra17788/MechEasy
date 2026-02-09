import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './BikeManagement.css';

const MyBikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const response = await api.get('/bikes');
      setBikes(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch bikes');
      setLoading(false);
    }
  };

  const handleDelete = async (bikeId, bikeName) => {
    if (!window.confirm(`Are you sure you want to delete ${bikeName}?`)) {
      return;
    }

    try {
      await api.delete(`/bikes/${bikeId}`);
      // Remove from local state
      setBikes(bikes.filter(bike => bike.id !== bikeId));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete bike');
    }
  };

  if (loading) {
    return (
      <>
        <NavBar title="MechEasy" />
        <div className="page-container">
          <div className="loading">Loading bikes...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>My Bikes</h1>
            <p>Manage your registered bikes</p>
          </div>
          <Link to="/bikes/add" className="btn-primary">
            + Add New Bike
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {bikes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏍️</div>
            <h2>No Bikes Added Yet</h2>
            <p>Add your first bike to start booking services</p>
            <Link to="/bikes/add" className="btn-primary">
              Add Your First Bike
            </Link>
          </div>
        ) : (
          <div className="bikes-grid">
            {bikes.map(bike => (
              <div key={bike.id} className="bike-card">
                {bike.image ? (
                  <div className="bike-image">
                    <img
                      src={`http://localhost:5000${bike.image}`}
                      alt={`${bike.brand} ${bike.model}`}
                    />
                  </div>
                ) : (
                  <div className="bike-image placeholder">
                    <span>🏍️</span>
                  </div>
                )}
                <div className="bike-info">
                  <h3>{bike.brand} {bike.model}</h3>
                  <p className="number-plate">{bike.numberPlate}</p>
                  <div className="bike-actions">
                    <Link to={`/book-service?bikeId=${bike.id}`} className="btn-book">
                      Book Service
                    </Link>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(bike.id, `${bike.brand} ${bike.model}`)}
                    >
                      Delete
                    </button>
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

export default MyBikes;
