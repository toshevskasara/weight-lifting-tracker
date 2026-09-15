import { useState } from 'react'
import { HashRouter as Router, Routes, Route }from 'react-router-dom'

import './App.css'
import { AuthProvider } from './components/AuthContext.jsx'
import RequireAuth from './components/RequireAuth.jsx'
import Homepage from './pages/Homepage.jsx'
import YourExercises from './pages/YourExercises.jsx'
import Workout from './pages/Workout.jsx'
import Layout from './Layout.jsx'
import Signup from './pages/Signup.jsx'
import PersonalBest from './pages/PersonalBest.jsx'


function App() {
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signup" element={<Signup />} />

          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Homepage />} />
            <Route path="/exercises" element={<YourExercises />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/best" element={<PersonalBest />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App
