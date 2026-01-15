import { Link, useNavigate } from 'react-router-dom'

function Navbar({ user, onLogout }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <nav>
      <div className="nav-links">
        <Link to="/dashboard">🏠 Főoldal</Link>
        <Link to="/messages">💬 Üzenetek</Link>
        <Link to="/users">👥 Felhasználók</Link>
      </div>
      <div className="user-info">
        <span>Bejelentkezve: {user?.username}</span>
        <button onClick={handleLogout}>Kijelentkezés</button>
      </div>
    </nav>
  )
}

export default Navbar
