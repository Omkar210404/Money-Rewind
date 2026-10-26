import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import { read, store } from './data.js'
import { Drag } from './Icons.jsx'

// Thin gold timeline: drag, click, or use the arrow keys.
export default function Timeline({ min, max, value, onChange, ghostYear, nowYear }) {
  const track = useRef(null)
  const [drag, setDrag] = useState(false)
  const [hint, setHint] = useState(() => !read('mtm:hinted', false))
  const span = max - min || 1
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
  const pos = (y) => ((y - min) / span) * 100

  const dismissHint = useCallback(() => {
    if (hint) {
      setHint(false)
      store('mtm:hinted', true)
    }
  }, [hint])

  const yearAt = useCallback(
    (clientX) => {
      const r = track.current.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
      return Math.round(min + t * span)
    },
    [min, span],
  )

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag(true)
    dismissHint()
    onChange(yearAt(e.clientX))
  }
  const onPointerMove = (e) => {
    if (!drag) return
    const y = yearAt(e.clientX)
    if (y !== value) onChange(y)
  }
  const onPointerUp = () => setDrag(false)

  const onKey = (e) => {
    const step = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -10, PageUp: 10 }[e.key]
    let next = null
    if (step) next = value + step
    if (e.key === 'Home') next = min
    if (e.key === 'End') next = max
    if (next == null) return
    e.preventDefault()
    dismissHint()
    onChange(Math.min(max, Math.max(min, next)))
  }

  useEffect(() => {
    if (!hint) return
    const t = setTimeout(dismissHint, 9000)
    return () => clearTimeout(t)
  }, [hint, dismissHint])

  const decades = []
  for (let y = Math.ceil(min / 10) * 10; y <= max; y += 10) decades.push(y)

  return (
    <div className="timeline">
      <div
        className={`tl-hit${drag ? ' dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="tl-track" ref={track}>
          <div className="tl-fill" style={{ width: `${pos(value)}%` }} />
          {decades.map((d) => (
            <div key={d} className={`tl-tick${d % 20 ? ' odd' : ''}`} style={{ left: `${pos(d)}%` }}>
              <span>{d}</span>
            </div>
          ))}
          {Array.from({ length: span + 1 }, (_, i) => min + i)
            .filter((y) => y % 10)
            .map((y) => (
              <div key={y} className="tl-minor" style={{ left: `${pos(y)}%` }} />
            ))}
          <div className="tl-now" style={{ left: '100%' }}>
            <span>NOW</span>
          </div>
          {ghostYear != null && ghostYear >= min && ghostYear <= max && (
            <div className="tl-ghost" style={{ left: `${pos(ghostYear)}%` }} title={`Comparison year ${ghostYear}`}>
              <span>{ghostYear}</span>
            </div>
          )}
          <div
            className="tl-handle"
            style={{ left: `${pos(value)}%` }}
            role="slider"
            tabIndex={0}
            aria-label="Year"
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={value === nowYear ? `${value}, latest data` : String(value)}
            onKeyDown={onKey}
          >
            <span className="tl-year">{value}</span>
          </div>
          <AnimatePresence>
            {hint && (
              <m.div
                className="tl-hint"
                style={{ left: `clamp(var(--hint-half), ${pos(value)}%, calc(100% - var(--hint-half)))`, x: '-50%' }}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ delay: 1.2, duration: 0.5 }}
              >
                <Drag className="tl-hint-icon" />
                {coarse ? 'Drag to travel through time' : 'Drag, or use ← →, to travel through time'}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
