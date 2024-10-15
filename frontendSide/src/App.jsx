import { useState } from 'react'
import { Navbar, ProtectedRoute } from './components'

import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import './App.css'

function App() {
  const isAuthenticated = false; // Replace this with your authentication logic 

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          {/* Add proteced routes here */}
        </Route>
        {/* Add other routes here */}
      </Routes>
    </Router>
  )
}

export default App
