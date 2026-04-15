import { useState, useEffect } from 'react'

function Documents({ stats, updateStats }) {
  const [docs, setDocs] = useState([
    { name: 'AI Notes-GateDA.pdf', size: '2.4 MB', chunks: 30, status: 'ready', date: 'Today' },
  ])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchDocs = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:8000/documents')
        const data = await res.json()
        if (data.documents) {
          setDocs(data.documents)
        }
      } catch (e) {
        // Use mock data if server not available
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  return (
    <>
      <div className="topbar">
        <div className="page-title-group">
          <div className="page-eyebrow">Library</div>
          <h1 className="page-title">Documents</h1>
          <p className="page-subtitle">{docs.length} document{docs.length !== 1 ? 's' : ''} indexed and ready</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Indexed Documents</div>
            <div className="card-subtitle">All documents available for semantic search</div>
          </div>
        </div>
        <div className="card-body" style={{ padding: '8px 0 0' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <span className="loading-spinner" style={{ width: 24, height: 24 }} />
            </div>
          ) : docs.length === 0 ? (
            <div className="chat-empty" style={{ padding: '60px 24px' }}>
              <span className="chat-empty-icon">◧</span>
              <p className="chat-empty-text">No documents indexed yet. Upload your first document from the Dashboard.</p>
            </div>
          ) : (
            <table className="doc-table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Size</th>
                  <th>Chunks</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((doc, i) => (
                  <tr key={i}>
                    <td>
                      <div className="doc-name-cell">
                        <div className="doc-file-icon">📄</div>
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td>{doc.size || '—'}</td>
                    <td>{doc.chunks || '—'}</td>
                    <td>{doc.date || '—'}</td>
                    <td>
                      <span className={`doc-status-badge ${doc.status || 'ready'}`}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {doc.status === 'processing' ? 'Processing' : 'Ready'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export default Documents