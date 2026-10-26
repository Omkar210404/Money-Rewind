// Loading, caching and all the money maths. Every number on screen goes
// through priceAt / incomeAt so missing data stays "no data", never a guess.

const CACHE_KEY = 'mtm:data:v1'

export async function loadData() {
  try {
    const res = await fetch('./data.json', { cache: 'no-cache' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    store(CACHE_KEY, data)
    return { data, fromCache: false }
  } catch (err) {
    const saved = read(CACHE_KEY)
    if (saved) return { data: saved, fromCache: true }
    throw err
  }
}

export function read(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode or full: the app still works without it */
  }
}

// ---------------------------------------------------------------- series

export function series(data, country, key, year) {
  const i = year - data.years[0]
  const v = country[key]?.[i]
  return v == null ? null : v
}

export const cpiAt = (data, c, y) => series(data, c, 'cpi', y)
export const fxAt = (data, c, y) => series(data, c, 'fx', y)

/** Hours in a working year used for "hours of work": 52 weeks x 40 hours. */
export const WORK_HOURS = 2080

/** Average income per hour of work (GDP per capita / 2,080 hours). */
export function hourlyAt(data, c, y) {
  const inc = incomeAt(data, c, y)
  return inc == null ? null : inc / WORK_HOURS
}

/**
 * Merge the visitor's own prices into the data. overrides: { ISO3: { item: { year, value } } }.
 * A personal price becomes one more anchor, so other years are CPI-scaled from it.
 */
export function applyOverrides(data, overrides) {
  if (!overrides || !Object.keys(overrides).length) return data
  return {
    ...data,
    countries: data.countries.map((c) => {
      const mine = overrides[c.iso3]
      if (!mine) return c
      const prices = { ...c.prices }
      for (const [item, o] of Object.entries(mine)) {
        if (!(o?.value > 0)) continue
        prices[item] = { ...(prices[item] || {}), [o.year]: { v: o.value, s: 'user', k: 'yours' } }
      }
      return { ...c, prices }
    }),
  }
}

/** Average income proxy (GDP per capita, local currency) for one year. */
export function incomeAt(data, c, y) {
  return series(data, c, 'gdppc', y)
}

/**
 * Price of one unit of an item in local currency.
 * Returns { value, kind, year, anchorYear, source } or null.
 * kind: observed | reference | derived | estimated
 */
export function priceAt(data, c, itemId, y) {
  const obs = c.prices?.[itemId]
  if (!obs) return null
  const exact = obs[y]
  if (exact) return { value: exact.v, kind: exact.k, year: y, anchorYear: y, source: exact.s }
  const cpiY = cpiAt(data, c, y)
  if (cpiY == null) return null
  // nearest measured year with a CPI value; later year wins a tie
  const anchors = Object.keys(obs)
    .map(Number)
    .filter((a) => cpiAt(data, c, a) != null)
    .sort((a, b) => Math.abs(a - y) - Math.abs(b - y) || b - a)
  if (!anchors.length) return null
  const a = anchors[0]
  return {
    value: (obs[a].v * cpiY) / cpiAt(data, c, a),
    kind: 'estimated',
    year: y,
    anchorYear: a,
    anchorKind: obs[a].k,
    source: obs[a].s,
  }
}

/** Latest year for which the country has a CPI value (used as "now"). */
export function latestYear(data, c) {
  for (let y = data.years[1]; y >= data.years[0]; y--) if (cpiAt(data, c, y) != null) return y
  return data.years[1]
}

export function kindLabel(p) {
  if (!p) return 'no data'
  switch (p.kind) {
    case 'observed':
      return `measured ${p.year}`
    case 'reference':
      return `published ${p.year} figure`
    case 'derived':
      return 'world gold price × exchange rate'
    case 'yours':
      return `your price (${p.year})`
    default:
      return `estimated from CPI (anchored to ${p.anchorKind === 'yours' ? 'your ' : ''}${p.anchorYear}${p.anchorKind === 'yours' ? ' price' : ''})`
  }
}

// ---------------------------------------------------------------- formatting

export function fmtCount(n) {
  if (n == null || !isFinite(n)) return '–'
  if (n === 0) return '0'
  if (n < 0.01) return '<0.01'
  if (n >= 1e9) return `${(n / 1e9).toLocaleString('en', { maximumFractionDigits: 1 })} bn`
  if (n >= 1e6) return `${(n / 1e6).toLocaleString('en', { maximumFractionDigits: 1 })} m`
  const digits = n >= 100 ? 0 : n >= 10 ? 1 : 2
  return n.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: 0 })
}

export function fmtMoney(c, v, opts = {}) {
  if (v == null || !isFinite(v)) return 'no data'
  const digits = opts.digits ?? (Math.abs(v) >= 1000 ? 0 : Math.abs(v) >= 1 ? 2 : 4)
  let s
  if (Math.abs(v) >= 1e9) s = `${(v / 1e9).toLocaleString('en', { maximumFractionDigits: 2 })} bn`
  else if (Math.abs(v) >= 1e6) s = `${(v / 1e6).toLocaleString('en', { maximumFractionDigits: 2 })} m`
  else s = v.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: Math.min(digits, 2) })
  return `${c.symbol}${s}`
}

/** "0.4 months", "3.2 days", "5 hours" of a month's income */
export function fmtShareOfMonth(months) {
  if (months == null || !isFinite(months)) return 'no data'
  if (months >= 0.95) return `${fmtCount(months)} months`
  const days = months * 30.44
  if (days >= 1) return `${fmtCount(days)} days`
  return `${fmtCount(days * 24)} hours`
}

/** "12 min", "2.4 h", "3.1 days" of work (8-hour days) */
export function fmtHours(h) {
  if (h == null || !isFinite(h)) return 'no data'
  if (h < 1 / 60) return '<1 min'
  if (h < 1) return `${Math.round(h * 60)} min`
  if (h < 40) return `${fmtCount(h)} h`
  return `${fmtCount(h / 8)} work days`
}

export function itemNoun(item, n) {
  const one = { bread: 'loaf', milk: 'litre of milk', fuel: 'litre of petrol', ticket: 'cinema ticket', gold: 'gram of gold' }
  return n != null && Math.abs(n - 1) < 0.005 ? one[item.id] : item.plural
}
