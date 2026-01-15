import { useState, useEffect } from 'react'

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalMessages: 0,
    totalUsers: 0,
  })
  const [loading, setLoading] = useState(true)

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
      <h1>Üdvözlünk, {user?.username}!</h1>
      
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
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '8px', 
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <h2>Üdvözli az Üzenetküldő Alkalmazás</h2>
        <p>Válassz felhasználót és kezdj üzeneteket küldeni!</p>
      </div>
    </div>
  )
}

export default Dashboard
