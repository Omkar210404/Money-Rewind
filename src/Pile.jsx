import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ItemArt, Pedestal } from './Art.jsx'
import { emitDust } from './Particles.jsx'
import { fmtCount } from './data.js'

// Design space matches the pedestal SVG: 560 x 400, top surface centred at y=190.
const W = 560
const H = 400

// Where each item group sits on the pedestal top and how it stacks.
const GROUPS = {
  fuel: { x: 196, base: 180, w: 64, h: 74, style: 'pyramid', bottom: 3, cap: 6, z: 1 },
  milk: { x: 344, base: 176, w: 36, h: 67, style: 'rows', bottom: 4, cap: 8, z: 1 },
  ticket: { x: 146, base: 210, w: 76, h: 35, style: 'stack', cap: 8, z: 2 },
  bread: { x: 276, base: 220, w: 90, h: 51, style: 'pyramid', bottom: 3, cap: 6, z: 3 },
  gold: { x: 414, base: 210, w: 48, h: 32, style: 'columns', cols: 2, cap: 10, z: 4 },
}

function hash(s) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

function place(g, i, n, id) {
  const j = hash(id + i) - 0.5
  if (g.style === 'stack') {
    return { x: g.x - g.w / 2 + j * 10, y: g.base - g.h - i * 5, rot: j * 14, z: i }
  }
  if (g.style === 'columns') {
    const col = i % g.cols
    const lvl = Math.floor(i / g.cols)
    return { x: g.x - g.w / 2 + (col - (g.cols - 1) / 2) * g.w * 0.92 + j * 2, y: g.base - g.h - lvl * 6.5, rot: j * 3, z: lvl * 2 + col }
  }
  if (g.style === 'rows') {
    const row = Math.floor(i / g.bottom)
    const col = i % g.bottom
    const inRow = Math.min(g.bottom, n - row * g.bottom)
    return {
      x: g.x - g.w / 2 + (col - (inRow - 1) / 2) * g.w * 1.04 + row * g.w * 0.5,
      y: g.base - g.h - row * 9,
      rot: j * 3,
      z: -row * 10 + col,
    }
  }
  // pyramid: rows of bottom, bottom-1, ... resting on each other
  let row = 0
  let start = 0
  let capRow = g.bottom
  while (i >= start + capRow) {
    start += capRow
    row++
    capRow = Math.max(1, capRow - 1)
  }
  const inRow = Math.min(capRow, n - start)
  const col = i - start
  return {
    x: g.x - g.w / 2 + (col - (inRow - 1) / 2) * g.w * 0.94 + j * 3,
    y: g.base - g.h - row * g.h * 0.7,
    rot: j * 7,
    z: row * 10 + col,
  }
}

const pct = (v, of) => `${(v / of) * 100}%`

/**
 * counts: { [itemId]: number | null }  (null = no data)
 */
export default function Pile({ counts, items, images, ghost = false, reduced = false, onSelect, label }) {
  const els = useRef(new Map())

  const objects = useMemo(() => {
    const out = []
    for (const it of items) {
      const g = GROUPS[it.id]
      const c = counts[it.id]
      if (!g || c == null || !isFinite(c) || c <= 0) continue
      const n = c > g.cap ? g.cap : Math.ceil(c - 1e-9)
      const frac = c > g.cap ? 1 : c - Math.floor(c - 1e-9)
      for (let i = 0; i < n; i++) {
        const p = place(g, i, n, it.id)
        out.push({
          key: `${it.id}-${i}`,
          id: it.id,
          i,
          ...p,
          w: g.w,
          h: g.h,
          zi: g.z * 100 + p.z,
          frac: i === n - 1 ? frac : 1,
        })
      }
    }
    return out
  }, [counts, items])

  // dissolve whatever left the pile since the last render
  const prev = useRef(new Set())
  useEffect(() => {
    const now = new Set(objects.map((o) => o.key))
    if (!ghost && !reduced) {
      for (const k of prev.current) {
        if (!now.has(k)) {
          const el = els.current.get(k)
          if (el) emitDust(el.getBoundingClientRect())
          els.current.delete(k)
        }
      }
    }
    prev.current = now
  }, [objects, ghost, reduced])

  const chips = items.map((it) => {
    const g = GROUPS[it.id]
    const c = counts[it.id]
    const n = c == null ? 0 : Math.min(g.cap, Math.ceil(c))
    const tops = objects.filter((o) => o.id === it.id).map((o) => o.y)
    const top = tops.length ? Math.min(...tops) : g.base - 20
    return { it, g, c, top, capped: c != null && c > g.cap, n }
  })

  return (
    <div className={`pile${ghost ? ' ghost' : ''}`} style={{ aspectRatio: `${W} / ${H}` }} role="img" aria-label={label}>
      <Pedestal ghost={ghost} />
      <AnimatePresence initial={!ghost && !reduced}>
        {objects.map((o) => (
          <motion.div
            key={o.key}
            ref={(el) => {
              if (el) els.current.set(o.key, el)
            }}
            className={`obj obj-${o.id}`}
            style={{
              left: pct(o.x, W),
              top: pct(o.y, H),
              width: pct(o.w, W),
              height: pct(o.h, H),
              zIndex: o.zi,
              // a partial object is cut to its fraction (never thinner than a visible sliver)
              clipPath: o.frac < 0.999 ? `inset(0 ${((1 - Math.max(o.frac, 0.12)) * 100).toFixed(1)}% 0 0)` : undefined,
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -90 - o.i * 6, rotate: o.rot - 10 }}
            animate={{ opacity: 1, y: 0, rotate: o.rot }}
            exit={reduced ? { opacity: 0, transition: { duration: 0.15 } } : { opacity: 0, scale: 0.86, y: -4, transition: { duration: 0.45, ease: 'easeOut' } }}
            transition={reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 320, damping: 22, mass: 0.7, delay: Math.min(o.i * 0.025, 0.2) }}
            onClick={onSelect ? () => onSelect(o.id) : undefined}
          >
            <ItemArt id={o.id} images={images} />
          </motion.div>
        ))}
      </AnimatePresence>
      {chips.map(({ it, g, c, top, capped }) => (
        <div
          key={it.id}
          className={`chip${c == null ? ' nodata' : ''}${capped ? ' capped' : ''}`}
          style={{ left: pct(g.x, W), top: pct(top - 6, H), zIndex: 900 }}
          title={c == null ? `${it.name}: no data` : `${fmtCount(c)} ${it.plural}`}
        >
          {c == null ? 'no data' : `${capped ? '×' : ''}${fmtCount(c)}`}
        </div>
      ))}
    </div>
  )
}
