import { useState, useEffect } from 'react'
import axios from 'axios'

function Messages({ user }) {
  const [messages, setMessages] = useState([])
  const [recipients, setRecipients] = useState([])
  const [selectedRecipient, setSelectedRecipient] = useState('')
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchMessages()
    fetchRecipients()
  }, [])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3001/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setMessages(response.data)
    } catch (err) {
      setError('Nem sikerült betölteni az üzeneteket')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3001/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      setRecipients(response.data)
    } catch (err) {
      console.error('Nem sikerült betölteni a felhasználókat')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!selectedRecipient || !messageText.trim()) {
      setError('Válassz címzettet és írj üzenetet!')
      return
    }

    try {
      const token = localStorage.getItem('token')
      await axios.post(
        'http://localhost:3001/api/messages',
        {
          recipient_id: selectedRecipient,
          content: messageText,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

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
        <div>
          <h2>Üzenetek küldése</h2>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={handleSendMessage} style={{ marginTop: '1rem' }}>
            <div className="form-group">
              <label htmlFor="recipient">Címzett:</label>
              <select
                id="recipient"
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                required
              >
                <option value="">-- Válassz felhasználót --</option>
                {recipients
                  .filter((r) => r.id !== user?.id)
                  .map((recipient) => (
                    <option key={recipient.id} value={recipient.id}>
                      {recipient.username} ({recipient.email})
                    </option>
                  ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="message">Üzenet:</label>
              <textarea
                id="message"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Írj üzenetet..."
                rows="5"
                required
              ></textarea>
            </div>

            <button type="submit">📤 Üzenet küldése</button>
          </form>
        </div>

        <hr style={{ margin: '2rem 0' }} />

        <div>
          <h2>Beérkezett üzenetek</h2>
          <div className="messages-list">
            {messages.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#999' }}>Nincs üzenet</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender_id === user?.id ? 'sent' : 'received'}`}>
                  <div className="message-meta">
                    <strong>{msg.sender_username || msg.recipient_username}</strong>
                    {msg.sender_id === user?.id && ' (Te küldted)'}
                    <br />
                    {new Date(msg.created_at).toLocaleString('hu-HU')}
                  </div>
                  <div className="message-text">{msg.content}</div>
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
