import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Bejelentkezés sikertelen')
        return
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user))
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError('Hiba a bejelentkezés során: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Regisztráció sikertelen')
        return
      }

      localStorage.setItem('currentUser', JSON.stringify(data.user))
      navigate('/')
      window.location.reload()
    } catch (err) {
      setError('Hiba a regisztráció során: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>
           Temu-s Messenger
        </h1>
        
        <p style={styles.subtitle}>
          {isRegistering ? 'Új fiók létrehozása' : 'Bejelentkezés'}
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} style={styles.form}>
          <input
            type="text"
            placeholder="Felhasználónév"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email cím"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Betöltés...' : (isRegistering ? 'Regisztráció' : 'Bejelentkezés')}
          </button>
        </form>

        <div style={styles.toggle}>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(!isRegistering)
              setError('')
              setUsername('')
              setEmail('')
              setPassword('')
            }}
            style={styles.toggleBtn}
          >
            {isRegistering 
              ? '← Vissza a bejelentkezéshez' 
              : 'Nincs még fiókom → Regisztrálok'}
          </button>
        </div>

        
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '40px',
    maxWidth: '400px',
    width: '100%'
  },
  title: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '10px',
    fontSize: '24px'
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '30px',
    fontSize: '16px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '4px',
    marginBottom: '15px',
    fontSize: '14px',
    textAlign: 'center'
  },
  toggle: {
    textAlign: 'center',
    marginTop: '20px'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'underline'
  },
  info: {
    marginTop: '30px',
    padding: '15px',
    backgroundColor: '#e7f3ff',
    borderRadius: '4px',
    fontSize: '13px',
    color: '#004085'
  }
}
