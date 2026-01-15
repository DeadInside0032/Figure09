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
      const response = await axios.get('http://localhost:3001/api/messages')
      // Ha admin, mutasd az összes üzenetet. Ha normál felhasználó, csak a sajátjait
      const allMessages = response.data
      if (!user?.is_admin) {
        const filtered = allMessages.filter(m => m.sender_id === user?.id || m.recipient_id === user?.id)
        setMessages(filtered)
      } else {
        setMessages(allMessages)
      }
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

  // Felhasználók szűrése keresés alapján
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
    <div className="container">
      <h1>💬 Üzenetek</h1>

      <div className="messages-container">
        {!user?.is_admin && (
          <div>
            <h2>Üzenetek küldése</h2>
            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <form onSubmit={handleSendMessage} style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label htmlFor="search">Keresés a felhasználók között:</label>
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
                  <strong style={{ color: '#000' }}>Kiválasztott címzett:</strong> {otherUsers.find(u => u.id === parseInt(selectedRecipient))?.username}
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
                  rows="5"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    color: '#000',
                    backgroundColor: '#fff'
                  }}
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={!selectedRecipient}
                style={{
                  opacity: selectedRecipient ? 1 : 0.5,
                  cursor: selectedRecipient ? 'pointer' : 'not-allowed'
                }}
              >
                📤 Üzenet küldése
              </button>
            </form>
          </div>
        )}

        <hr style={{ margin: '2rem 0' }} />

        <div>
          <h2>{user?.is_admin ? '📊 Összes beszélgetés' : '💬 Saját beszélgetéseid'}</h2>
          <div className="messages-list">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Nincs üzenet</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                  <div className="message-meta" style={{ color: '#000' }}>
                    <strong style={{ color: '#000' }}>
                      {user?.is_admin ? (
                        <>
                          {msg.sender_username} → {msg.recipient_username}
                        </>
                      ) : (
                        <>
                          {msg.sender_id === user?.id ? 'Te' : msg.sender_username}
                          {' - '}
                          {msg.recipient_id === user?.id ? 'Te' : msg.recipient_username}
                        </>
                      )}
                    </strong>
                    <br />
                    <span style={{ color: '#000' }}>{new Date(msg.created_at).toLocaleString('hu-HU')}</span>
                  </div>
                  <div className="message-text" style={{ color: '#000' }}>{msg.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messages
