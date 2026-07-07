import { useState, useRef, useCallback } from 'react'
import './App.css'
import BackgroundAnimation from './BackgroundAnimation'

function App() {
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef(null)

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const handleFileChange = (e) => {
    handleFile(e.target.files[0])
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const [apiError, setApiError] = useState(null)

  const handleDragLeave = () => setIsDragging(false)

  // ─── API Call ─────────────────────────────────────────────────────────────
  // TODO: Replace API_ENDPOINT with your actual endpoint URL.
  // Expected response shape:
  // {
  //   label:       string,   // e.g. "No Cancer Detected"
  //   status:      string,   // "negative" | "positive" | "benign"
  //   confidence:  number,   // 0–100
  //   description: string,   // AI-generated analysis text
  //   image1:      string,   // base64 data-URI or absolute URL  (e.g. original annotated)
  //   image2:      string,   // base64 data-URI or absolute URL  (e.g. heatmap / overlay)
  //   image1Label: string,   // optional caption for image1
  //   image2Label: string,   // optional caption for image2
  // }
  const STATUS_META = {
    negative: { color: '#00BFBF', icon: '✓' },
    positive: { color: '#E05252', icon: '⚠' },
    benign:   { color: '#F5A623', icon: '◉' },
  }

  const handleUpload = async () => {
    if (!image) return
    setIsAnalyzing(true)
    setResult(null)
    setApiError(null)

    const API_ENDPOINT = 'https://YOUR_API_ENDPOINT_HERE/analyse' // TODO: replace

    const formData = new FormData()
    formData.append('image', image)
    // formData.append('model', 'cancer-v2')  // TODO: add any extra fields your API needs

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        body: formData,
        // headers: { Authorization: `Bearer YOUR_TOKEN` }, // TODO: add auth if needed
      })

      if (!response.ok) {
        const errText = await response.text()
        throw new Error(`Server error ${response.status}: ${errText}`)
      }

      const data = await response.json()

      // Normalise the response into the shape the UI expects
      const meta = STATUS_META[data.status] ?? STATUS_META.negative
      setResult({
        label:       data.label       ?? 'Analysis Complete',
        status:      data.status      ?? 'negative',
        confidence:  data.confidence  ?? 0,
        description: data.description ?? '',
        image1:      data.image1      ?? null,
        image2:      data.image2      ?? null,
        image1Label: data.image1Label ?? 'Original',
        image2Label: data.image2Label ?? 'AI Overlay',
        color:       meta.color,
        icon:        meta.icon,
      })
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleReset = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setApiError(null)
    setIsAnalyzing(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="app">
      <BackgroundAnimation />
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" stroke="#00BFBF" strokeWidth="2" />
                <circle cx="14" cy="14" r="5" fill="#00BFBF" opacity="0.18" />
                <circle cx="14" cy="14" r="3" fill="#00BFBF" />
                <line x1="14" y1="2" x2="14" y2="7" stroke="#00BFBF" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="14" y1="21" x2="14" y2="26" stroke="#00BFBF" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="2" y1="14" x2="7" y2="14" stroke="#00BFBF" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="21" y1="14" x2="26" y2="14" stroke="#00BFBF" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-name">GemmaSight</span>
              <span className="logo-tagline">AI Cancer Detection</span>
            </div>
          </div>
          <nav className="header-nav">
            <span className="nav-badge">Beta</span>
            <button className="camera-btn" aria-label="Use camera">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="main">
        <div className="container">

          {/* Hero */}
          <div className="hero">
            <h1 className="hero-title">Early Detection Saves Lives</h1>
            <p className="hero-sub">Upload a medical scan or pathology image for AI-powered cancer analysis in seconds.</p>
          </div>

          {/* Upload Card */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Image Analysis</h2>
              <p className="card-desc">Supports JPEG, PNG, TIFF — max 20 MB</p>
            </div>

            {/* Drop zone */}
            <div
              className={`drop-zone${isDragging ? ' dragging' : ''}${preview ? ' has-image' : ''}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !preview && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && !preview && fileInputRef.current?.click()}
              aria-label="Image drop zone"
            >
              {preview ? (
                <div className="preview-wrapper">
                  <img src={preview} alt="Selected scan" className="preview-img" />
                  <button className="remove-btn" onClick={(e) => { e.stopPropagation(); handleReset() }} aria-label="Remove image">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                  <div className="preview-badge">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                    {image?.name}
                  </div>
                </div>
              ) : (
                <div className="drop-placeholder">
                  <div className="drop-icon-wrap">
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#00BFBF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                  <p className="drop-text">Drag &amp; drop your scan here</p>
                  <p className="drop-hint">or click to browse files</p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden-input"
              aria-hidden="true"
            />

            {/* Buttons */}
            <div className="btn-row">
              <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                Select Image
              </button>
              <button
                className={`btn btn-secondary${!image || isAnalyzing ? ' disabled' : ''}`}
                onClick={handleUpload}
                disabled={!image || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <span className="spinner" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="16 16 12 12 8 16" />
                      <line x1="12" y1="12" x2="12" y2="21" />
                      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
                    </svg>
                    Upload &amp; Analyse
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Card */}
          <div className={`result-card${result || apiError ? ' visible' : ''}`}>
            <div className="result-header">
              <h2 className="result-title">Prediction Result</h2>
            </div>

            {apiError ? (
              <div className="result-body">
                <div className="api-error">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>{apiError}</span>
                </div>
                <button className="btn btn-outline" onClick={handleReset}>Try Again</button>
              </div>
            ) : result ? (
              <div className="result-body">

                {/* Status badge */}
                <div className="result-status" style={{ '--status-color': result.color }}>
                  <span className="result-icon">{result.icon}</span>
                  <div className="result-info">
                    <span className="result-label">{result.label}</span>
                    <span className="result-confidence">Confidence: {result.confidence}%</span>
                  </div>
                </div>

                {/* Confidence bar */}
                <div className="confidence-bar">
                  <div className="confidence-track">
                    <div
                      className="confidence-fill"
                      style={{ width: `${result.confidence}%`, backgroundColor: result.color }}
                    />
                  </div>
                  <span className="confidence-pct">{result.confidence}%</span>
                </div>

                {/* AI-returned images */}
                {(result.image1 || result.image2) && (
                  <div className="result-images">
                    {result.image1 && (
                      <div className="result-image-wrap">
                        <img
                          src={result.image1}
                          alt={result.image1Label}
                          className="result-img"
                        />
                        <span className="result-img-label">{result.image1Label}</span>
                      </div>
                    )}
                    {result.image2 && (
                      <div className="result-image-wrap">
                        <img
                          src={result.image2}
                          alt={result.image2Label}
                          className="result-img"
                        />
                        <span className="result-img-label">{result.image2Label}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                {result.description && (
                  <div className="result-description">
                    <p className="result-description-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                      AI Analysis
                    </p>
                    <p className="result-description-text">{result.description}</p>
                  </div>
                )}

                {/* Disclaimer */}
                <p className="result-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  This result is for informational purposes only. Please consult a qualified medical professional for diagnosis.
                </p>

                <button className="btn btn-outline" onClick={handleReset}>Analyse Another Image</button>
              </div>
            ) : (
              <div className="result-placeholder">
                <div className="result-placeholder-icon">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00BFBF" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <p>Upload an image and click <strong>Upload &amp; Analyse</strong> to see results</p>
              </div>
            )}
          </div>

          {/* Feature pills */}
          <div className="features">
            {[
              { icon: '⚡', label: 'Fast Analysis', desc: 'Results in under 5s' },
              { icon: '🔒', label: 'Private & Secure', desc: 'No data stored' },
              { icon: '🎯', label: 'High Accuracy', desc: '94%+ precision' },
            ].map((f) => (
              <div key={f.label} className="feature-pill">
                <span className="feature-pill-icon">{f.icon}</span>
                <div>
                  <p className="feature-pill-label">{f.label}</p>
                  <p className="feature-pill-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="footer">
        <p>© 2026 GemmaSight · AI-powered cancer screening · Not a substitute for medical advice</p>
      </footer>
    </div>
  )
}

export default App
