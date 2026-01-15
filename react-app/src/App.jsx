import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UserDashboard from './pages/UserDashboard'
import Messages from './pages/Messages'
import Users from './pages/Users'
import ConversationPartners from './pages/ConversationPartners'
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
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Hiba a felhasználók betöltésénél:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('currentUser')
    setCurrentUser(null)
  }

  if (loading) return <div className="loading">Betöltés...</div>

  return (
    <Router>
      <AppContent 
        currentUser={currentUser} 
        handleLogout={handleLogout} 
        fetchUsers={fetchUsers} 
        users={users} 
        loading={loading} 
      />
    </Router>
  )
}

function AppContent({ currentUser, handleLogout, fetchUsers, users, loading }) {
  const location = useLocation();
  if (loading) return <div className="loading">Betöltés...</div>;
  return (
    !currentUser ? (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    ) : (
      <>
        {location.pathname === '/' && (
          <div style={{ 
              background: 'white', 
              padding: '2rem', 
              borderRadius: '8px', 
              margin: '1rem 2rem 0 2rem',
              textAlign: 'center',
              color:'black',
              maxWidth: '1200px',
              marginLeft: 'auto',
              marginRight: 'auto'
          }}>
              <h2>Üdvözli a Temu-s Messenger</h2>
          </div>
        )}
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
              <Route path="/partners" element={<ConversationPartners user={currentUser} />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </>
    )
  );
}

export default App
