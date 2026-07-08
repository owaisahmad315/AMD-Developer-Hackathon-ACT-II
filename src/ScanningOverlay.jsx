import './ScanningOverlay.css'

export default function ScanningOverlay({ isActive }) {
  if (!isActive) return null

  return (
    <div className="scanning-overlay">
      {/* Main scanning beam */}
      <div className="scan-line-main" />

      {/* Secondary highlight lines for depth effect */}
      <div className="scan-line-secondary scan-line-secondary-1" />
      <div className="scan-line-secondary scan-line-secondary-2" />

      {/* Glow effect background */}
      <div className="scan-glow" />

      {/* Grid overlay for scanning effect */}
      <svg className="scan-grid" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="scanGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(0, 191, 191, 0.08)" strokeWidth="0.3" />
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(0, 191, 191, 0.08)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#scanGrid)" />
      </svg>

      {/* Scanning text indicator */}
      <div className="scan-text">
        <span>🔍 Scanning...</span>
      </div>
    </div>
  )
}
