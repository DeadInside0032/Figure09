import { Link, useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.link}>🏠 Főoldal</Link>
        
        <div style={styles.userInfo}>
          <span style={styles.userName}>
            👤 {user?.username} {user?.is_admin && '👑'}
          </span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Kijelentkezés
          </button>
        </div>
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#007bff',
    color: 'white',
    padding: '1rem',
    borderRadius: '8px',
    margin: '1rem auto 2rem auto',
    maxWidth: '1200px',
    display: 'flex',
    justifyContent: 'center'
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
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
    fontSize: '16px',
    whiteSpace: 'nowrap'
  },
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
}

export default Navbar
