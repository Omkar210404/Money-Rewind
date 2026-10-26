import { useEffect, useRef } from 'react'

// One full-screen canvas of golden dust. Objects that leave a pile call
// emitDust(rect); the pile also feeds a faint stream from one side.
// Capped at ~800 particles on desktop and ~250 on phones; the loop sleeps
// when nothing is alive or the tab is hidden.

const sys = {
  ctx: null,
  w: 0,
  h: 0,
  dpr: 1,
  list: [],
  max: 800,
  raf: 0,
  last: 0,
  enabled: true,
  sprite: null,
  stream: null, // () => DOMRect | null
  streamAcc: 0,
}

function makeSprite() {
  const s = document.createElement('canvas')
  s.width = s.height = 32
  const g = s.getContext('2d')
  const grad = g.createRadialGradient(16, 16, 0, 16, 16, 16)
  grad.addColorStop(0, 'rgba(255,236,190,1)')
  grad.addColorStop(0.25, 'rgba(240,196,110,.85)')
  grad.addColorStop(1, 'rgba(217,165,74,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 32, 32)
  return s
}

function spawn(x, y, opts = {}) {
  if (sys.list.length >= sys.max) return
  const life = opts.life ?? 1.1 + Math.random() * 1.3
  sys.list.push({
    x,
    y,
    vx: (opts.vx ?? 18) + Math.random() * 40,
    vy: (opts.vy ?? -10) - Math.random() * 30,
    size: 1.1 + Math.random() * (opts.big ? 4 : 2.4),
    life,
    age: 0,
    seed: Math.random() * 6.28,
  })
}

/** Dissolve a rectangle (viewport coords) into dust drifting to the right. */
export function emitDust(rect, amount = 1) {
  if (!sys.enabled || !sys.ctx || !rect) return
  const n = Math.min(60, Math.round((rect.width * rect.height) / 110) + 8) * amount
  const room = sys.max - sys.list.length
  for (let i = 0; i < Math.min(n, room); i++) {
    spawn(rect.left + Math.random() * rect.width, rect.top + Math.random() * rect.height, { big: Math.random() < 0.15 })
  }
  wake()
}

/** A gentle constant stream from the edge of the main pile. */
export function setDustStream(fn) {
  sys.stream = fn
  if (fn) wake()
}

function wake() {
  if (!sys.raf && sys.enabled && !document.hidden) {
    sys.last = performance.now()
    sys.raf = requestAnimationFrame(tick)
  }
}

function tick(now) {
  const dt = Math.min(0.05, (now - sys.last) / 1000)
  sys.last = now
  const { ctx, list } = sys
  ctx.setTransform(sys.dpr, 0, 0, sys.dpr, 0, 0)
  ctx.clearRect(0, 0, sys.w, sys.h)

  if (sys.stream) {
    sys.streamAcc += dt * 4 // particles per second
    if (sys.streamAcc >= 1) {
      const r = sys.stream()
      while (sys.streamAcc >= 1) {
        sys.streamAcc -= 1
        if (r && r.bottom > 0 && r.top < sys.h)
          spawn(r.left + Math.random() * r.width, r.top + Math.random() * r.height, { vx: 8, vy: -6, life: 2.4 + Math.random() * 2 })
      }
    }
  }

  ctx.globalCompositeOperation = 'lighter'
  let alive = 0
  for (let i = 0; i < list.length; i++) {
    const p = list[i]
    p.age += dt
    if (p.age >= p.life) continue
    const t = p.age / p.life
    p.vx += (14 + Math.sin(p.seed + p.age * 2.2) * 22) * dt // drift to one side with a little swirl
    p.vy += (-16 + Math.cos(p.seed + p.age * 1.7) * 10) * dt // rise like warm dust
    p.vx *= 0.985
    p.vy *= 0.985
    p.x += p.vx * dt
    p.y += p.vy * dt
    const a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
    const s = p.size * (1 - t * 0.5)
    ctx.globalAlpha = a * 0.9
    ctx.drawImage(sys.sprite, p.x - s, p.y - s, s * 2, s * 2)
    list[alive++] = p
  }
  list.length = alive
  ctx.globalAlpha = 1

  if (alive || sys.stream) sys.raf = requestAnimationFrame(tick)
  else {
    ctx.clearRect(0, 0, sys.w, sys.h)
    sys.raf = 0
  }
}

export function ParticleCanvas({ enabled }) {
  const ref = useRef(null)

  useEffect(() => {
    sys.enabled = enabled
    if (!enabled) {
      cancelAnimationFrame(sys.raf)
      sys.raf = 0
      sys.list.length = 0
      sys.ctx?.clearRect(0, 0, sys.w, sys.h)
    } else wake()
  }, [enabled])

  useEffect(() => {
    const canvas = ref.current
    sys.ctx = canvas.getContext('2d')
    sys.sprite = makeSprite()
    const mq = window.matchMedia('(max-width: 760px)')
    const resize = () => {
      sys.dpr = Math.min(window.devicePixelRatio || 1, 2)
      sys.w = window.innerWidth
      sys.h = window.innerHeight
      canvas.width = Math.round(sys.w * sys.dpr)
      canvas.height = Math.round(sys.h * sys.dpr)
      sys.max = mq.matches ? 250 : 800
    }
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(sys.raf)
        sys.raf = 0
      } else wake()
    }
    resize()
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      cancelAnimationFrame(sys.raf)
      sys.raf = 0
      sys.ctx = null
    }
  }, [])

  return <canvas ref={ref} className="particles" aria-hidden="true" />
}
