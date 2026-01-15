import { useState, useEffect } from 'react'
import axios from 'axios'

function Messages({ user }) {
  const [messages, setMessages] = useState([])
  const [otherUsers, setOtherUsers] = useState([])
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMessages()
    fetchOtherUsers()
  }, [user?.id])

  const fetchMessages = async () => {
    try {
      setMessages([])
    } catch (err) {
      setError('Nem sikerült betölteni az üzeneteket')
    } finally {
      setLoading(false)
    }
  }

  const fetchOtherUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/users')
      const others = response.data.filter(u => u.id !== user?.id)
      setOtherUsers(others)
    } catch (err) {
      console.error('Nem sikerült betölteni a felhasználókat')
    }
  }

  const filteredUsers = otherUsers.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedRecipient || !messageText.trim()) {
      setError('Válassz címzettet és írj üzenetet!')
      return
    }

    try {
      await axios.post('http://localhost:3001/api/messages', {
        sender_id: user?.id,
        recipient_id: parseInt(selectedRecipient),
        content: messageText,
      })

      setSuccess('Üzenet sikeresen elküldve!')
      setMessageText('')
      fetchMessages()
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült elküldeni az üzenetet')
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  return (
    <div className="container" style={{ width: '100%', maxWidth: 'none', margin: 0, padding: 0, background: 'none' }}>

      <div className="messages-container" style={{ width: '100%', maxWidth: '1400px', margin: '40px auto', display: 'block' }}>
        {!user?.is_admin && (
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSendMessage} style={{ marginTop: '2.5rem', fontSize: '1.2rem', width: '100%', maxWidth: '1400px', background: '#f7faff', padding: '2.5rem 1.5rem', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}>
              <div className="form-group">
                <label htmlFor="search">Keresés:</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Írd be a felhasználónevet vagy emailt..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setSelectedRecipient('')
                  }}
                  style={{ 
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    color: '#000'
                  }}
                />
              </div>

              {searchTerm && filteredUsers.length > 0 && (
                <div style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  marginBottom: '1rem',
                  backgroundColor: '#f9f9f9'
                }}>
                  {filteredUsers.map((recipient) => (
                    <div
                      key={recipient.id}
                      onClick={() => {
                        setSelectedRecipient(recipient.id)
                        setSearchTerm('')
                      }}
                      style={{
                        padding: '0.75rem',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        hover: { backgroundColor: '#f0f0f0' },
                        color: '#000'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
                    >
                      <strong style={{ color: '#000' }}>{recipient.username}</strong>
                      <br />
                      <span style={{ fontSize: '0.9rem', color: '#666' }}>{recipient.email}</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedRecipient && otherUsers.find(u => u.id === parseInt(selectedRecipient)) && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: '#e7f3ff',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  color: '#000'
                }}>
                  <strong style={{ color: '#000' }}>Címzett:</strong> {otherUsers.find(u => u.id === parseInt(selectedRecipient))?.username}
                  <button
                    type="button"
                    onClick={() => setSelectedRecipient('')}
                    style={{
                      marginLeft: '1rem',
                      padding: '0.3rem 0.6rem',
                      backgroundColor: '#ff6b6b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    ✕ Törlés
                  </button>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="message">Üzenet:</label>
                <textarea
                  id="message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Írj üzenetet..."
                  rows="6"
                  required
                  style={{
                    width: '100%',
                    minWidth: '100%',
                    maxWidth: '100%',
                    minHeight: '100px',
                    resize: 'vertical',
                    padding: '1.2rem',
                    color: '#000',
                    backgroundColor: '#fff',
                    fontSize: '1rem',
                    borderRadius: '12px',
                    border: '2px solid #b3d4fc',
                    boxSizing: 'border-box',
                    marginBottom: '2.5rem',
                  }}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={!selectedRecipient}
                style={{
                  opacity: selectedRecipient ? 1 : 0.5,
                  cursor: selectedRecipient ? 'pointer' : 'not-allowed',
                  fontSize: '1.2rem',
                  padding: '0.8rem 2.2rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #4f8cff 0%, #38c6ff 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 'bold',
                  marginTop: '0.5rem',
                  boxShadow: '0 2px 8px rgba(79,140,255,0.08)'
                }}
              >
                 Üzenet küldése
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  )
}

export default Messages
