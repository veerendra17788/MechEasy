import React from 'react'
import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './components/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MyBikes from './pages/MyBikes'
import AddBike from './pages/AddBike'
import Services from './pages/Services'
import BookService from './pages/BookService'
import MyBookings from './pages/MyBookings'
import AdminDashboard from './pages/AdminDashboard'


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home title="MechEasy" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bikes" element={<MyBikes />} />
          <Route path="/bikes/add" element={<AddBike />} />
          <Route path="/services" element={<Services />} />
          <Route path="/book-service" element={<BookService />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
