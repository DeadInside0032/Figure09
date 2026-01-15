import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/stats')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      console.error('Nem sikerült betölteni az adatokat')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  return (
    <div className="container">
      <h1>Üdvözlünk, {user?.username}! 👑</h1>
      
      <div className="users-grid" style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => navigate('/messages')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <div className="user-card" style={{ textAlign: 'center', padding: '2rem', transition: 'transform 0.2s' }} 
               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <h3>📨 Összes üzenet</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              {stats.totalMessages}
            </p>
          </div>
        </button>
        
        <button 
          onClick={() => navigate('/users')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'center'
          }}
        >
          <div className="user-card" style={{ textAlign: 'center', padding: '2rem', transition: 'transform 0.2s' }}
               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            <h3>👥 Felhasználók</h3>
            <p style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>
              {stats.totalUsers}
            </p>
          </div>
        </button>
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        textAlign: 'center',
        color:'black'
      }}>
        <h2>Üdvözli a Temu-s Messenger</h2>
        <p>Kattints a kártyákra a navigációhoz!</p>
      </div>
    </div>
  )
}

export default Dashboard
