import React from 'react'
import { Link } from 'react-router-dom'
import NavBar from './NavBar'
import './css/Home.css'

const Home = (props) => {
  return (
    <>
      <NavBar title={props.title} />
      <div className="home-container">
        <section className="hero-section">
          <h1 className="hero-title">Your Bike's Best Friend</h1>
          <p className="hero-subtitle">
            Professional bike service at your doorstep. Book now and experience hassle-free maintenance.
          </p>
          <div className="hero-buttons">
            <Link to="/register" className="btn-hero-primary">Get Started</Link>
            <Link to="/login" className="btn-hero-secondary">Login</Link>
          </div>
        </section>

        <section className="features-section">
          <h2>Why Choose MechEasy?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Pickup & Drop</h3>
              <p>We pick up your bike, service it, and deliver it back to you</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Home Service</h3>
              <p>Expert mechanics come to your location for on-site service</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3>Visit Center</h3>
              <p>Visit our service center for immediate assistance</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>Simple slot-based booking system for your convenience</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💳</div>
              <h3>Flexible Payment</h3>
              <p>Pay online or choose cash on delivery</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Service</h3>
              <p>Experienced mechanics and genuine spare parts</p>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home