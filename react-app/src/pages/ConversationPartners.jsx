import { useState, useEffect } from 'react'
import axios from 'axios'

function ConversationPartners({ user }) {
  const [partners, setPartners] = useState([])
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageText, setMessageText] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchConversationPartners()
  }, [user?.id])

  const fetchConversationPartners = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/${user?.id}`)
      const userMessages = response.data

      const partnersSet = new Map()
      userMessages.forEach(msg => {
        if (msg.sender_id === user?.id) {
          const partnerId = msg.recipient_id
          if (!partnersSet.has(partnerId)) {
            partnersSet.set(partnerId, msg.recipient_username)
          }
        } else {
          const partnerId = msg.sender_id
          if (!partnersSet.has(partnerId)) {
            partnersSet.set(partnerId, msg.sender_username)
          }
        }
      })

      setPartners(Array.from(partnersSet, ([id, username]) => ({ id, username })))
    } catch (err) {
      setError('Nem sikerült betölteni a partnereket')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessagesWithPartner = async (partnerId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/messages/${user?.id}`)
      const userMessages = response.data
      const filtered = userMessages.filter(m =>
        (m.sender_id === user?.id && m.recipient_id === partnerId) ||
        (m.recipient_id === user?.id && m.sender_id === partnerId)
      )
      setMessages(filtered)
    } catch (err) {
      console.error('Nem sikerült betölteni az üzeneteket')
    }
  }

  const handleSelectPartner = (partnerId) => {
    setSelectedPartnerId(partnerId)
    setError('')
    setSuccess('')
    fetchMessagesWithPartner(partnerId)
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!messageText.trim()) {
      setError('Írj egy üzenetet!')
      return
    }

    try {
      await axios.post('http://localhost:3001/api/messages', {
        sender_id: user?.id,
        recipient_id: selectedPartnerId,
        content: messageText,
      })

      setSuccess('Üzenet sikeresen elküldve!')
      setMessageText('')
      fetchMessagesWithPartner(selectedPartnerId)
    } catch (err) {
      setError(err.response?.data?.message || 'Nem sikerült elküldeni az üzenetet')
    }
  }

  if (loading) return <div className="container"><p>Betöltés...</p></div>

  const selectedPartner = partners.find(p => p.id === selectedPartnerId)

  return (
    <div className="container">
      <h2> Beszélgetés partnerei</h2>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ 
          flex: '0 0 250px',
          background: '#f9f9f9',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          <h3>Partnerek</h3>
          {partners.length === 0 ? (
            <p style={{ color: '#999' }}>Nincsenek partnerei még</p>
          ) : (
            <div>
              {partners.map(partner => (
                <div
                  key={partner.id}
                  onClick={() => handleSelectPartner(partner.id)}
                  style={{
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    background: selectedPartnerId === partner.id ? '#007bff' : '#fff',
                    color: selectedPartnerId === partner.id ? '#fff' : '#000',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    border: '1px solid #ddd',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedPartnerId !== partner.id) {
                      e.currentTarget.style.background = '#e9ecef'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPartnerId !== partner.id) {
                      e.currentTarget.style.background = '#fff'
                    }
                  }}
                >
                  <strong>{partner.username}</strong>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedPartnerId && (
          <div style={{ flex: '1' }}>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div style={{
              background: '#f9f9f9',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              marginBottom: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              minHeight: '200px'
            }}>
              {messages.length === 0 ? (
                <p style={{ color: '#999' }}>Nincsenek üzenetek még</p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} style={{
                    marginBottom: '0.75rem',
                    padding: '0.75rem',
                    background: msg.sender_id === user?.id ? '#e3f2fd' : '#fff',
                    borderRadius: '4px',
                    border: '1px solid #ddd'
                  }}>
                    <strong style={{ color: '#000' }}>
                      {msg.sender_id === user?.id ? 'Te' : msg.sender_username}
                    </strong>
                    <p style={{ color: '#000', margin: '0.5rem 0 0 0' }}>{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <textarea
                  placeholder="Írd meg az üzenetet..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  style={{
                    padding: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    color: '#000',
                    minHeight: '100px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#218838'}
                  onMouseLeave={(e) => e.target.style.background = '#28a745'}
                >
                  Küld
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default ConversationPartners
