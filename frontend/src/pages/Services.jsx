import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './Services.css';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchServices();
  }, [filter]);

  const fetchServices = async () => {
    try {
      const url = filter === 'all' ? '/services' : `/services?category=${filter}`;
      const response = await api.get(url);
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setLoading(false);
    }
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}min`;
    if (hours > 0) return `${hours}h`;
    return `${mins}min`;
  };

  const categories = [
    { value: 'all', label: 'All Services', emoji: '🛠️' },
    { value: 'maintenance', label: 'Maintenance', emoji: '🔧' },
    { value: 'repair', label: 'Repair', emoji: '⚙️' },
    { value: 'wash', label: 'Wash', emoji: '🧼' },
    { value: 'package', label: 'Packages', emoji: '📦' }
  ];

  if (loading) {
    return (
      <>
        <NavBar title="MechEasy" />
        <div className="page-container">
          <div className="loading">Loading services...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="services-page">
        <div className="services-header">
          <h1>Our Services</h1>
          <p>Professional bike servicing at your convenience</p>
        </div>

        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat.value}
              className={`filter-tab ${filter === cat.value ? 'active' : ''}`}
              onClick={() => setFilter(cat.value)}
            >
              <span className="tab-emoji">{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              <div className="service-header">
                <h3>{service.name}</h3>
                <span className={`category-badge ${service.category}`}>
                  {service.category}
                </span>
              </div>
              <p className="service-description">{service.description}</p>
              <div className="service-details">
                <div className="detail-item">
                  <span className="detail-icon">💰</span>
                  <span className="detail-value">{formatPrice(service.price)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">⏱️</span>
                  <span className="detail-value">{formatDuration(service.duration)}</span>
                </div>
              </div>
              <button className="btn-book-service">
                Book Now →
              </button>
            </div>
          ))}
        </div>

        {services.length === 0 && (
          <div className="empty-state">
            <p>No services found in this category</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Services;
