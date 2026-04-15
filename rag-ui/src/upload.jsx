import { useState, useRef } from 'react'

const API_BASE = 'http://localhost:8000/api'

function Upload({ updateStats, standalone }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)
  const inputRef = useRef()

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleFile = (f) => {
    if (f && (f.type === 'application/pdf' || f.name.endsWith('.txt') || f.name.endsWith('.docx'))) {
      setFile(f)
    } else {
      showToast('Please upload a PDF, TXT, or DOCX file', 'error')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(interval); return 85 }
        return p + Math.random() * 15
      })
    }, 200)

    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Upload failed')
      }

      const data = await res.json()
      clearInterval(interval)
      setProgress(100)

      // ✅ FIX: backend returns "doc_id", not "document_id"
      localStorage.setItem('doc_id', data.doc_id)

      // ✅ FIX: poll until indexing is done
      pollStatus(data.doc_id, file.name)

    } catch (err) {
      clearInterval(interval)
      setUploading(false)
      setProgress(0)
      showToast(`Upload failed: ${err.message}`, 'error')
    }
  }

  const pollStatus = async (doc_id, fileName) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${doc_id}`)
        const data = await res.json()

        if (data.status === 'done') {
          clearInterval(interval)
          setUploading(false)
          setProgress(0)
          setFile(null)
          showToast(`✓ "${fileName}" uploaded & indexed`)
          // ✅ FIX: updateStats receives a plain object, not a function
          if (updateStats) {
            updateStats({ documents: 1 })
          }
        } else if (data.status === 'error') {
          clearInterval(interval)
          setUploading(false)
          setProgress(0)
          showToast('Indexing failed. Try re-uploading.', 'error')
        }
        // still "processing" → keep polling
      } catch (e) {
        clearInterval(interval)
        setUploading(false)
        showToast('Could not check indexing status.', 'error')
      }
    }, 1500)
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getFileIcon = (name) => {
    if (name.endsWith('.pdf')) return '📄'
    if (name.endsWith('.docx')) return '📝'
    return '📃'
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Upload Documents</div>
            <div className="card-subtitle">Supported: PDF, TXT, DOCX</div>
          </div>
        </div>
        <div className="card-body">
          <div
            className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !file && inputRef.current.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.txt,.docx"
              style={{ display: 'none' }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <span className="upload-icon">
              {dragOver ? '📂' : '☁'}
            </span>
            <div className="upload-text-primary">
              {dragOver ? 'Drop to upload' : 'Drop file here or click to browse'}
            </div>
            <div className="upload-text-secondary">
              Your documents are processed locally<br />and indexed for semantic search
            </div>
            <div className="upload-file-types">
              <span className="file-type-badge">PDF</span>
              <span className="file-type-badge">TXT</span>
              <span className="file-type-badge">DOCX</span>
            </div>
          </div>

          {file && (
            <div className="selected-file">
              <span className="selected-file-icon">{getFileIcon(file.name)}</span>
              <span className="selected-file-name">{file.name}</span>
              <span className="selected-file-size">{formatSize(file.size)}</span>
              {!uploading && (
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}
                >×</button>
              )}
            </div>
          )}

          {uploading && (
            <div className="progress-container">
              <div className="progress-label">
                <span>Indexing document…</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? (
              <><span className="loading-spinner" /> Processing…</>
            ) : (
              <>⬆ Upload & Index</>
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            <span>{toast.type === 'success' ? '✓' : '⚠'}</span>
            {toast.msg}
          </div>
        </div>
      )}
    </>
  )
}

export default Upload