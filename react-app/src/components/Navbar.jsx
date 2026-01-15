import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Navbar({ user, onLogout }) {
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [addUserError, setAddUserError] = useState('')
  const navigate = useNavigate()

  const handleAddUser = async () => {
    if (!newUsername || !newEmail || !newPassword) {
      setAddUserError('Felhasználónév, email és jelszó szükséges!')
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          email: newEmail,
          password: newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setAddUserError(data.message || 'Hiba a felhasználó létrehozásakor')
        return
      }

      setNewUsername('')
      setNewEmail('')
      setNewPassword('')
      setShowAddUser(false)
      setAddUserError('')
    } catch (err) {
      setAddUserError('Hiba: ' + err.message)
    }
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.navLinks}>
        <Link to="/" style={styles.link}>🏠 Főoldal</Link>
        <Link to="/messages" style={styles.link}>💬 Üzenetek</Link>
        {user?.is_admin && (
          <Link to="/users" style={styles.link}>👥 Felhasználók</Link>
        )}
      </div>
      <div style={styles.userInfo}>
        <span style={styles.userName}>
          👤 {user?.username} {user?.is_admin && '👑'}
        </span>
        {user?.is_admin && (
          <button onClick={() => setShowAddUser(!showAddUser)} style={styles.addButton}>
            ➕ Új Felhasználó
          </button>
        )}
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Kijelentkezés
        </button>
      </div>

      {showAddUser && (
        <div style={styles.addUserForm}>
          {addUserError && <div style={styles.errorMsg}>{addUserError}</div>}
          <input
            type="text"
            placeholder="Felhasználónév"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Jelszó"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleAddUser} style={styles.createButton}>
            Létrehozás
          </button>
          <button onClick={() => setShowAddUser(false)} style={styles.cancelButton}>
            Mégse
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    background: '#007bff',
    color: 'white',
    padding: '1rem',
    marginBottom: '2rem'
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
    marginBottom: '1rem'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '16px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userName: {
    fontSize: '16px'
  },
  addButton: {
    padding: '0.5rem 1rem',
    background: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  addUserForm: {
    background: 'white',
    color: 'black',
    padding: '1rem',
    marginTop: '1rem',
    borderRadius: '4px',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  input: {
    padding: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ddd'
  },
  errorMsg: {
    color: 'red',
    fontSize: '12px',
    width: '100%'
  },
  createButton: {
    padding: '0.5rem 1rem',
    background: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    background: '#ccc',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
}

export default Navbar
