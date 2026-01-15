import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username,
        password,
      })

      const { user, token } = response.data
      onLogin(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Bejelentkezés sikertelen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Bejelentkezés</h2>
        {error && <div className="alert alert-error">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="username">Felhasználónév:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Jelszó:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
        </button>

        <div className="link">
          Nincs még fiók? <Link to="/register">Regisztráció</Link>
        </div>
      </form>
    </div>
  )
}

export default Login
