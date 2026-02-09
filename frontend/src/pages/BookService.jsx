import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './BookService.css';

const BookService = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedBikeId = searchParams.get('bikeId');

  const [step, setStep] = useState(1);
  const [bikes, setBikes] = useState([]);
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    bikeId: preselectedBikeId || '',
    serviceId: '',
    date: '',
    timeSlot: '',
    serviceType: '',
    address: ''
  });

  const [selectedBike, setSelectedBike] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBikes();
    fetchServices();
  }, []);

  useEffect(() => {
    if (preselectedBikeId) {
      const bike = bikes.find(b => b.id === parseInt(preselectedBikeId));
      setSelectedBike(bike);
    }
  }, [bikes, preselectedBikeId]);

  useEffect(() => {
    if (formData.date && formData.serviceId) {
      fetchAvailableSlots();
    }
  }, [formData.date, formData.serviceId]);

  const fetchBikes = async () => {
    try {
      const response = await api.get('/bikes');
      setBikes(response.data);
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await api.get('/services');
      setServices(response.data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get(`/bookings/slots?date=${formData.date}&serviceId=${formData.serviceId}`);
      setAvailableSlots(response.data.availableSlots);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleBikeSelect = (bike) => {
    setFormData({ ...formData, bikeId: bike.id });
    setSelectedBike(bike);
    setStep(2);
  };

  const handleServiceSelect = (service) => {
    setFormData({ ...formData, serviceId: service.id });
    setSelectedService(service);
    setStep(3);
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, date: e.target.value, timeSlot: '' });
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, timeSlot: slot });
    setStep(4);
  };

  const handleServiceTypeChange = (type) => {
    setFormData({ ...formData, serviceType: type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/bookings', formData);
      setLoading(false);
      navigate('/bookings');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to create booking');
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatPrice = (priceInPaise) => {
    return `₹${(priceInPaise / 100).toFixed(2)}`;
  };

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="book-service-container">
        <div className="booking-header">
          <h1>Book a Service</h1>
          <div className="step-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Bike</div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Service</div>
            <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Date & Time</div>
            <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Details</div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Select Bike */}
        {step === 1 && (
          <div className="step-content">
            <h2>Select Your Bike</h2>
            {bikes.length === 0 ? (
              <div className="empty-state">
                <p>You haven't added any bikes yet.</p>
                <button className="btn-primary" onClick={() => navigate('/bikes/add')}>
                  Add Your First Bike
                </button>
              </div>
            ) : (
              <div className="bikes-grid">
                {bikes.map(bike => (
                  <div
                    key={bike.id}
                    className={`bike-card ${formData.bikeId === bike.id ? 'selected' : ''}`}
                    onClick={() => handleBikeSelect(bike)}
                  >
                    {bike.image ? (
                      <img src={`http://localhost:5000${bike.image}`} alt={bike.brand} />
                    ) : (
                      <div className="placeholder">🏍️</div>
                    )}
                    <h3>{bike.brand} {bike.model}</h3>
                    <p className="number-plate">{bike.numberPlate}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Service */}
        {step === 2 && (
          <div className="step-content">
            <button className="btn-back" onClick={() => setStep(1)}>← Back</button>
            <h2>Select a Service</h2>
            <div className="services-grid">
              {services.map(service => (
                <div
                  key={service.id}
                  className={`service-card ${formData.serviceId === service.id ? 'selected' : ''}`}
                  onClick={() => handleServiceSelect(service)}
                >
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                  <div className="service-info">
                    <span className="price">{formatPrice(service.price)}</span>
                    <span className="duration">{service.duration} min</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select Date & Time */}
        {step === 3 && (
          <div className="step-content">
            <button className="btn-back" onClick={() => setStep(2)}>← Back</button>
            <h2>Select Date & Time</h2>
            
            <div className="date-selection">
              <label htmlFor="date">Select Date:</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={handleDateChange}
                min={getTomorrowDate()}
              />
            </div>

            {formData.date && (
              <div className="slots-section">
                <h3>Available Time Slots</h3>
                {availableSlots.length === 0 ? (
                  <p className="no-slots">No slots available for this date. Please try another date.</p>
                ) : (
                  <div className="slots-grid">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        className={`slot-btn ${formData.timeSlot === slot ? 'selected' : ''}`}
                        onClick={() => handleSlotSelect(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Service Type & Address */}
        {step === 4 && (
          <div className="step-content">
            <button className="btn-back" onClick={() => setStep(3)}>← Back</button>
            <h2>Service Details</h2>

            <div className="service-type-section">
              <h3>Select Service Type</h3>
              <div className="service-types">
                <div
                  className={`type-card ${formData.serviceType === 'visit' ? 'selected' : ''}`}
                  onClick={() => handleServiceTypeChange('visit')}
                >
                  <span className="type-icon">🏢</span>
                  <h4>Visit Center</h4>
                  <p>Bring your bike to our service center</p>
                </div>
                <div
                  className={`type-card ${formData.serviceType === 'pickup' ? 'selected' : ''}`}
                  onClick={() => handleServiceTypeChange('pickup')}
                >
                  <span className="type-icon">🚚</span>
                  <h4>Pickup & Drop</h4>
                  <p>We'll pickup and deliver your bike</p>
                </div>
                <div
                  className={`type-card ${formData.serviceType === 'home' ? 'selected' : ''}`}
                  onClick={() => handleServiceTypeChange('home')}
                >
                  <span className="type-icon">🏠</span>
                  <h4>Home Service</h4>
                  <p>Mechanic will come to your location</p>
                </div>
              </div>
            </div>

            {(formData.serviceType === 'pickup' || formData.serviceType === 'home') && (
              <div className="address-section">
                <label htmlFor="address">Your Address *</label>
                <textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your complete address"
                  rows="3"
                  required
                />
              </div>
            )}

            {formData.serviceType && (
              <div className="booking-summary">
                <h3>Booking Summary</h3>
                <div className="summary-item">
                  <span>Bike:</span>
                  <strong>{selectedBike?.brand} {selectedBike?.model}</strong>
                </div>
                <div className="summary-item">
                  <span>Service:</span>
                  <strong>{selectedService?.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Date:</span>
                  <strong>{new Date(formData.date).toLocaleDateString()}</strong>
                </div>
                <div className="summary-item">
                  <span>Time:</span>
                  <strong>{formData.timeSlot}</strong>
                </div>
                <div className="summary-item">
                  <span>Type:</span>
                  <strong>{formData.serviceType}</strong>
                </div>
                <div className="summary-item total">
                  <span>Total Amount:</span>
                  <strong>{formatPrice(selectedService?.price || 0)}</strong>
                </div>
              </div>
            )}

            {formData.serviceType && (
              <button
                className="btn-confirm"
                onClick={handleSubmit}
                disabled={loading || (formData.serviceType !== 'visit' && !formData.address)}
              >
                {loading ? 'Creating Booking...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default BookService;
