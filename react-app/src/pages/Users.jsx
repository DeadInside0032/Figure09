import { useState, useEffect } from 'react'
import axios from 'axios'

function Users({ user, onUserDeleted }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await axios.get(`${API}/api/users`)
      setUsers(response.data)
    } catch (err) {
      setError('Nem sikerült betölteni a felhasználókat')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
      try {
        await axios.delete(`http://localhost:3001/api/users/${userId}`)
        onUserDeleted()
        fetchUsers()
      } catch (err) {
        setError('Nem sikerült törölni a felhasználót')
      }
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  return (
    <div className="container">
      <h1>👥 Felhasználók kezelése</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="users-grid">
        {users.map((u) => (
          <div key={u.id} className="user-card">
            <h3>{u.username}</h3>
            <p>📧 {u.email}</p>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>
              Csatlakozás: {new Date(u.created_at).toLocaleDateString('hu-HU')}
            </p>
            {user?.id !== u.id && (
              <button
                onClick={() => handleDeleteUser(u.id)}
                style={{ background: 'var(--danger)' }}
              >
                🗑️ Törlés
              </button>
            )}
            {user?.id === u.id && (
              <p style={{ padding: '0.75rem', background: '#e7f3ff', borderRadius: '4px', color: 'var(--primary)' }}>
                ✓ Ez a te fiókod
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Users
