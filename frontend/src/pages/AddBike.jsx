import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import NavBar from '../components/NavBar';
import './BikeManagement.css';

const AddBike = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    numberPlate: ''
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only image files (JPEG, PNG, GIF, WebP) are allowed');
        return;
      }

      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create FormData for file upload
      const data = new FormData();
      data.append('brand', formData.brand);
      data.append('model', formData.model);
      data.append('numberPlate', formData.numberPlate.toUpperCase());
      if (image) {
        data.append('image', image);
      }

      const response = await api.post('/bikes', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setLoading(false);
      navigate('/bikes');
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || 'Failed to add bike');
    }
  };

  return (
    <>
      <NavBar title="MechEasy" />
      <div className="page-container">
        <div className="page-header">
          <h1>Add New Bike</h1>
          <p>Add your bike details for service bookings</p>
        </div>

        <div className="form-container">
          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="brand">Brand *</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                placeholder="e.g., Honda, Yamaha, Royal Enfield"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model *</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
                placeholder="e.g., CB350, FZ, Classic 350"
              />
            </div>

            <div className="form-group">
              <label htmlFor="numberPlate">Number Plate *</label>
              <input
                type="text"
                id="numberPlate"
                name="numberPlate"
                value={formData.numberPlate}
                onChange={handleChange}
                required
                placeholder="e.g., DL01AB1234"
                style={{ textTransform: 'uppercase' }}
              />
              <small>Enter the registration number without spaces</small>
            </div>

            <div className="form-group">
              <label htmlFor="image">Bike Image (Optional)</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small>Max size: 5MB. Formats: JPEG, PNG, GIF, WebP</small>
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Bike preview" />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/bikes')}
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Adding Bike...' : 'Add Bike'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddBike;
