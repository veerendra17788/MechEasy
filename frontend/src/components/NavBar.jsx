import React from 'react'
import icon from '../assets/icon.png'
//css for navbar  
import './css/NavBar.css'

const NavBar = (props) => {
  return (
    <div className="navbar">
      <img src={icon} alt="title-icon.png" className="navbar-icon"/>
      <h1 className='navbar-title'>{props.title}</h1>
    </div>
  )
}

export default NavBar