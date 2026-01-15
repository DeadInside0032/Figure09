import { useState, useEffect } from 'react'
import axios from 'axios'

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3001/api/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setStats(response.data)
    } catch (err) {
      setError('Nem sikerült betölteni az adatokat')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  return (
    <div className="container">
      <h1>Üdvözlünk, {user?.username}!</h1>
      {error && <div className="alert alert-error">{error}</div>}
      
      <div className="users-grid" style={{ marginTop: '2rem' }}>
        <div className="user-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>📨 Összes üzenet</h3>
          <p style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
            {stats.totalMessages}
          </p>
        </div>
        
        <div className="user-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>👥 Felhasználók</h3>
          <p style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>
            {stats.totalUsers}
          </p>
        </div>
        
        <div className="user-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <h3>🔔 Olvasatlan üzenetek</h3>
          <p style={{ fontSize: '2rem', color: 'var(--warning)', fontWeight: 'bold' }}>
            {stats.unreadMessages}
          </p>
        </div>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <h2>Üdvözli az Üzenetküldő Alkalmazás</h2>
        <p>Sikeresen bejelentkeztél. Használd az oldalsó menüt az üzenetek és felhasználók kezeléséhez!</p>
      </div>
    </div>
  )
}

export default Dashboard
