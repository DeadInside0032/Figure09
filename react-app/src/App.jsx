import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Messages from './pages/Messages'
import Users from './pages/Users'
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Ellenőrzük, van-e bejelentkezett felhasználó
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const handleLogin = (userData, token) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    localStorage.setItem('token', token)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  if (loading) return <div className="loading">Betöltés...</div>

  return (
    <Router>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register onLogin={handleLogin} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/messages" element={user ? <Messages user={user} /> : <Navigate to="/login" />} />
        <Route path="/users" element={user ? <Users user={user} /> : <Navigate to="/login" />} />
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App
