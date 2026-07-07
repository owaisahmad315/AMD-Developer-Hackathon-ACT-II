import { useMemo } from 'react'

function rand(min, max) { return Math.random() * (max - min) + min }

// ECG path — two full repeats so translateX(-50%) loops seamlessly
const ECG_D =
  'M0,35 L200,35 L218,35 L234,12 L250,58 L264,4 L278,66 L294,35 ' +
  'L494,35 L510,35 L526,12 L542,58 L556,4 L570,66 L586,35 ' +
  'L786,35 L802,35 L818,12 L834,58 L848,4 L862,66 L878,35 ' +
  'L1078,35 L1094,35 L1110,12 L1126,58 L1140,4 L1154,66 L1170,35 ' +
  'L1370,35 L1386,35 L1402,12 L1418,58 L1432,4 L1446,66 L1462,35 L1462,35 ' +
  // ── second repeat starts at 1462 ──
  'L1662,35 L1678,35 L1694,12 L1710,58 L1724,4 L1738,66 L1754,35 ' +
  'L1954,35 L1970,35 L1986,12 L2002,58 L2016,4 L2030,66 L2046,35 ' +
  'L2246,35 L2262,35 L2278,12 L2294,58 L2308,4 L2322,66 L2338,35 ' +
  'L2538,35 L2554,35 L2570,12 L2586,58 L2600,4 L2614,66 L2630,35 ' +
  'L2830,35 L2846,35 L2862,12 L2878,58 L2892,4 L2906,66 L2922,35 L2924,35'

export default function BackgroundAnimation() {
  const cells = useMemo(() =>
    Array.from({ length: 13 }, (_, i) => ({
      id: i,
      x:        rand(2, 98),
      size:     rand(20, 68),
      delay:    rand(0, 22),
      duration: rand(14, 28),
      variant:  i % 3,
    })), [])

  const dnaPairs = useMemo(() =>
    Array.from({ length: 9 }, (_, i) => ({
      id: i,
      x:        rand(4, 96),
      size:     rand(16, 32),
      delay:    rand(0, 22),
      duration: rand(16, 30),
    })), [])

  const crosses = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x:        rand(6, 94),
      y:        rand(6, 94),
      size:     rand(12, 26),
      delay:    rand(0, 14),
      duration: rand(7, 15),
    })), [])

  const pulseRings = [
    { left: '8%',  top: '22%', delay: '0s',   sz: 64 },
    { left: '82%', top: '58%', delay: '2.8s', sz: 80 },
    { left: '48%', top: '80%', delay: '5.6s', sz: 56 },
    { left: '92%', top: '12%', delay: '8.4s', sz: 48 },
    { left: '22%', top: '72%', delay: '11s',  sz: 70 },
  ]

  return (
    <div className="bg-anim" aria-hidden="true">

      {/* ── Aurora glow blobs ── */}
      <div className="bg-aurora bg-aurora-1" />
      <div className="bg-aurora bg-aurora-2" />
      <div className="bg-aurora bg-aurora-3" />

      {/* ── Scanning beam ── */}
      <div className="bg-scan-beam" />

      {/* ── Pulse rings ── */}
      {pulseRings.map((p, i) => (
        <div
          key={i}
          className="bg-pulse-ring"
          style={{ left: p.left, top: p.top, width: p.sz, height: p.sz, animationDelay: p.delay }}
        />
      ))}

      {/* ── Floating cell rings ── */}
      {cells.map(c => (
        <div
          key={c.id}
          className={`bg-cell bg-cell-${c.variant}`}
          style={{
            left:              `${c.x}%`,
            width:             `${c.size}px`,
            height:            `${c.size}px`,
            animationDelay:    `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        />
      ))}

      {/* ── Floating DNA pairs ── */}
      {dnaPairs.map(d => (
        <div
          key={d.id}
          className="bg-dna-pair"
          style={{
            left:              `${d.x}%`,
            width:             `${d.size}px`,
            animationDelay:    `${d.delay}s`,
            animationDuration: `${d.duration}s`,
          }}
        >
          <svg viewBox="0 0 30 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            {[0, 1, 2, 3].map(i => {
              const y   = i * 18 + 9
              const ox  = Math.sin(i * (Math.PI * 2 / 4)) * 11
              return (
                <g key={i}>
                  <line
                    x1={15 + ox} y1={y} x2={15 - ox} y2={y}
                    stroke="rgba(0,191,191,0.5)" strokeWidth="1.2"
                  />
                  <circle cx={15 + ox} cy={y} r="3.5" fill="rgba(0,191,191,0.45)" />
                  <circle cx={15 - ox} cy={y} r="3.5" fill="rgba(0,212,224,0.38)" />
                </g>
              )
            })}
          </svg>
        </div>
      ))}

      {/* ── Medical crosses ── */}
      {crosses.map(c => (
        <div
          key={c.id}
          className="bg-cross"
          style={{
            left:              `${c.x}%`,
            top:               `${c.y}%`,
            width:             `${c.size}px`,
            height:            `${c.size}px`,
            animationDelay:    `${c.delay}s`,
            animationDuration: `${c.duration}s`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="20" rx="1.5" fill="currentColor" />
            <rect x="2" y="9" width="20" height="6" rx="1.5" fill="currentColor" />
          </svg>
        </div>
      ))}

      {/* ── ECG heartbeat line ── */}
      <div className="bg-ecg-wrap">
        <svg className="bg-ecg-svg" viewBox="0 0 2924 70" preserveAspectRatio="none">
          <defs>
            <filter id="ecgGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path className="bg-ecg-path" d={ECG_D} filter="url(#ecgGlow)" />
        </svg>
      </div>

    </div>
  )
}
