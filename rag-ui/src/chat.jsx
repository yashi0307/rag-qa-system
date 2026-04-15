import { useState, useRef, useEffect } from 'react'

const API_BASE = 'http://localhost:8000/api'

const QUICK_PROMPTS = [
  'What is this document about?',
  'Explain main concepts in the document',
  'What are key findings?',
  'Explain important topics'
]

function Chat({ stats, updateStats, compact }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => { scrollToBottom() }, [messages])

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const sendMessage = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return

    const doc_id = localStorage.getItem('doc_id')

    // Check if document uploaded
    if (!doc_id) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠ Please upload a document first.',
        time: formatTime(),
      }])
      return
    }

    const userMsg = { role: 'user', content: q, time: formatTime() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      // ✅ FIX: correct API URL with /api prefix
      const res = await fetch(`${API_BASE}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, doc_id }),
      })

      // ✅ FIX: handle 202 (still processing) gracefully
      if (res.status === 202) {
        setMessages(prev => [...prev, {
          role: 'ai',
          content: '⏳ Document is still being indexed. Please wait a moment and try again.',
          time: formatTime(),
        }])
        setLoading(false)
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Query failed')
      }

      const data = await res.json()

      const aiMsg = {
        role: 'ai',
        content: data.answer || 'No answer returned.',
        sources: data.sources || [],
        time: formatTime(),
      }

      setMessages(prev => [...prev, aiMsg])

      // ✅ FIX: updateStats receives plain object, not a function
      if (updateStats) {
        updateStats({ queries: (stats?.queries || 0) + 1 })
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: `❌ Error: ${err.message}`,
        time: formatTime(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleTextareaChange = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="card" style={compact ? {} : { minHeight: '60vh' }}>
      <div className="card-header">
        <div>
          <div className="card-title">Ask Questions</div>
          <div className="card-subtitle">
            {stats?.documents > 0
              ? `Searching across ${stats.documents} document${stats.documents !== 1 ? 's' : ''}`
              : 'Upload a document to get started'}
          </div>
        </div>

        {messages.length > 0 && (
          <button
            className="btn btn-secondary"
            onClick={() => setMessages([])}
          >
            Clear
          </button>
        )}
      </div>

      <div className="card-body">
        <div className="chat-area">

          {/* Quick prompts */}
          {messages.length === 0 && (
            <div className="quick-prompts">
              {QUICK_PROMPTS.map(p => (
                <button key={p} className="quick-prompt-chip" onClick={() => sendMessage(p)}>
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="chat-empty">
                <span className="chat-empty-icon">◎</span>
                <p className="chat-empty-text">
                  Ask anything about your uploaded documents
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`message message-${msg.role}`}>
                  <div className="message-bubble">{msg.content}</div>

                  {msg.sources && msg.sources.length > 0 && (
                    <div className="sources-list">
                      {msg.sources.slice(0, 2).map((src, j) => (
                        <div key={j} className="source-item">
                          📄 {src.source || `Source ${j + 1}`}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="message-time">{msg.time}</div>
                </div>
              ))
            )}

            {loading && (
              <div className="message message-ai">
                <div className="message-bubble">
                  ⏳ Thinking...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-group">
            <textarea
              ref={textareaRef}
              className="chat-input"
              placeholder="Ask a question about your documents…"
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="btn-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
            >
              ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat