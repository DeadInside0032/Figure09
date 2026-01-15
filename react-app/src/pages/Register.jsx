import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

function Register({ onLogin }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirm) {
      setError('A jelszavak nem egyeznek')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username,
        email,
        password,
      })

      const { user, token } = response.data
      onLogin(user, token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Regisztráció sikertelen')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h2>Regisztráció</h2>
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
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        <div className="form-group">
          <label htmlFor="passwordConfirm">Jelszó megerősítés:</label>
          <input
            type="password"
            id="passwordConfirm"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Regisztráció...' : 'Regisztráció'}
        </button>

        <div className="link">
          Már van fiók? <Link to="/login">Bejelentkezés</Link>
        </div>
      </form>
    </div>
  )
}

export default Register
