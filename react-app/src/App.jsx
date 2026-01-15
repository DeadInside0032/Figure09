import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import Messages from './pages/Messages'
import Users from './pages/Users'
import Navbar from './components/Navbar'

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      console.error('Hiba a felhasználók betöltésénél:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  if (loading) return <div className="loading">Betöltés...</div>

  return (
    <Router>
      {!currentUser ? (
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      ) : (
        <>
          <Navbar 
            user={currentUser} 
            onLogout={handleLogout}
          />
          <Routes>
            {currentUser?.is_admin ? (
              <>
                <Route path="/" element={<Dashboard user={currentUser} />} />
                <Route path="/messages" element={<Messages user={currentUser} />} />
                <Route path="/users" element={<Users user={currentUser} onUserDeleted={fetchUsers} />} />
              </>
            ) : (
              <>
                <Route path="/" element={<UserDashboard user={currentUser} />} />
                <Route path="/messages" element={<Messages user={currentUser} />} />
              </>
            )}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </>
      )}
    </Router>
  )
}

export default App
