import { useState } from 'react'
import { HashRouter as Router, Routes, Route }from 'react-router-dom'

import './App.css'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './components/Dashboard.jsx'
import Homepage from './pages/Homepage.jsx'
import YourExercises from './pages/YourExercises.jsx'
import Workout from './pages/Workout.jsx'
import Layout from './Layout.jsx'
import Signup from './pages/Signup.jsx'
import PersonalBest from './pages/PersonalBest.jsx'

function App() {
  
  return(
    <>
      <Router>
        <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Homepage />} />
          <Route path="/exercises" element={<YourExercises />} />
          <Route path="/workout" element={<Workout />} />
          <Route path="/best" element={<PersonalBest />} />
        </Route>
        <Route path="/signup" element={<Signup />} />
        </Routes>
      </Router>
    </>
  );
}

export default App
