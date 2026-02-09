import React from 'react'
import NavBar from './NavBar'

const Home = (props) => {
  return (
    <nav>
      <NavBar title={props.title} />
    </nav>
  )
}

export default Home