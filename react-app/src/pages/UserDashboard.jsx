import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function UserDashboard({ user }) {
  const [stats, setStats] = useState({
    userMessages: 0,
    conversationPartners: 0,
  })
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchStats()
  }, [user?.id])

  const fetchStats = async () => {
    try {
      // Lekérjük az adott felhasználó üzeneteit
      const messagesResponse = await fetch(`http://localhost:3001/api/messages/${user?.id}`)
      const messages = await messagesResponse.json()
      
      // Összes üzenet száma az adott felhasználónak
      const userMessages = messages.length

      // Hány különböző partnerrel kommunikál
      const partners = new Set()
      messages.forEach(msg => {
        if (msg.sender_id === user?.id) {
          partners.add(msg.recipient_id)
        } else {
          partners.add(msg.sender_id)
        }
      })

      setStats({
        userMessages: userMessages,
        conversationPartners: partners.size
      })
    } catch (err) {
      console.error('Nem sikerült betölteni az adatokat:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  return (
    <div className="container">
    
      
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
            <h2 className='black'> Kuldj uzenetet</h2>
            <p style={{ fontSize: '2rem', color: 'var(--primary)', fontWeight: 'bold' }}>
              
            </p>
          </div>
        </button>
        
        <button 
          onClick={() => navigate('/partners')}
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
            <h2 className='black'>Beszelgetesek</h2>
            <p style={{ fontSize: '2rem', color: 'var(--success)', fontWeight: 'bold' }}>
              {stats.conversationPartners}
            </p>
          </div>
        </button>
      </div>
    </div>
  )
}

export default UserDashboard
