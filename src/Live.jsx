import { useEffect, useState } from 'react'
import { read, store } from './data.js'

// Today's exchange rates (open.er-api.com, daily) and gold/silver spot
// (gold-api.com). Both are free and need no key. Values are cached; if a
// request fails the last saved values are shown with their time. Nothing
// here ever blocks the page.

const KEY = 'mtm:live:v1'
const REFRESH_MS = 10 * 60 * 1000
const FRESH_MS = 30 * 60 * 1000
const TROY_OZ_G = 31.1034768

async function getJSON(url) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } finally {
    clearTimeout(t)
  }
}

export function useLive() {
  const [live, setLive] = useState(() => read(KEY, null))
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let stop = false
    const pull = async () => {
      if (document.hidden) return
      const next = { ...(read(KEY, null) || {}) }
      let ok = false
      const [fx, gold, silver] = await Promise.allSettled([
        getJSON('https://open.er-api.com/v6/latest/USD'),
        getJSON('https://api.gold-api.com/price/XAU'),
        getJSON('https://api.gold-api.com/price/XAG'),
      ])
      if (fx.status === 'fulfilled' && fx.value?.result === 'success') {
        next.rates = fx.value.rates
        next.ratesTime = fx.value.time_last_update_unix * 1000
        ok = true
      }
      if (gold.status === 'fulfilled' && gold.value?.price > 0) {
        next.gold = gold.value.price
        next.goldTime = Date.parse(gold.value.updatedAt) || Date.now()
        ok = true
      }
      if (silver.status === 'fulfilled' && silver.value?.price > 0) {
        next.silver = silver.value.price
        next.silverTime = Date.parse(silver.value.updatedAt) || Date.now()
      }
      if (stop) return
      if (ok) {
        next.fetchedAt = Date.now()
        store(KEY, next)
        setLive(next)
      }
      setFailed(!ok)
    }
    pull()
    const id = setInterval(pull, REFRESH_MS)
    const onVis = () => !document.hidden && Date.now() - (read(KEY, null)?.fetchedAt || 0) > REFRESH_MS && pull()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('online', pull)
    return () => {
      stop = true
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('online', pull)
    }
  }, [])

  const fresh = !!live?.fetchedAt && Date.now() - live.fetchedAt < FRESH_MS && !failed
  return { live, fresh, failed }
}

const time = (ms) =>
  ms ? new Date(ms).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '–'

function num(v, digits) {
  if (v == null || !isFinite(v)) return '–'
  const d = digits ?? (v >= 1000 ? 0 : v >= 10 ? 2 : 4)
  return v.toLocaleString('en', { maximumFractionDigits: d, minimumFractionDigits: Math.min(d, 2) })
}

export function Ticker({ live, fresh, country }) {
  if (!live) {
    return (
      <div className="ticker empty" aria-live="polite">
        <span>Live rates loading… the site works without them.</span>
      </div>
    )
  }
  const cur = country?.currency
  const r = live.rates || {}
  const pairs = ['USD', 'EUR', 'GBP', 'JPY', 'INR', 'CNY'].filter((c) => c !== cur && r[c] && (cur ? r[cur] : true)).slice(0, 4)
  const items = []
  if (cur && r[cur]) {
    for (const p of pairs) items.push([`${p} → ${cur}`, num(r[cur] / r[p])])
  }
  if (live.gold) {
    items.push(['Gold', `$${num(live.gold, 0)}/oz`])
    if (cur && r[cur]) items.push([`Gold in ${cur}`, `${country.symbol}${num((live.gold / TROY_OZ_G) * r[cur])}/g`])
  }
  if (live.silver) items.push(['Silver', `$${num(live.silver, 2)}/oz`])

  const row = (aria) => (
    <div className="ticker-row" aria-hidden={aria ? undefined : 'true'}>
      {items.map(([k, v]) => (
        <span key={k} className="tick">
          <i>{k}</i> {v}
        </span>
      ))}
      <span className="tick meta">
        Rates {time(live.ratesTime)} · metals {time(live.goldTime)}
        {!fresh && ' · saved values'}
      </span>
      <span className="tick meta">
        Rates by <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">ExchangeRate-API</a> · metals by{' '}
        <a href="https://gold-api.com" target="_blank" rel="noreferrer">gold-api.com</a>
      </span>
    </div>
  )

  return (
    <div className={`ticker${fresh ? '' : ' stale'}`} aria-label="Today's exchange rates and metal prices">
      <div className="ticker-track">
        {row(true)}
        {row(false)}
      </div>
    </div>
  )
}
