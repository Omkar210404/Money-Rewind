import { useEffect, useMemo, useRef, useState } from 'react'
import { scaleLinear, scaleLog } from 'd3-scale'
import { cpiAt, fmtCount, incomeAt } from './data.js'

// Prices (CPI) and average income, both indexed to 100 in the start year, on
// one shared log axis. The bright part is drawn from the start year to the
// year on the timeline, so it "draws" as you scrub.

const PRICE = 'var(--c-price)'
const INCOME = 'var(--c-income)'

function useWidth(ref) {
  const [w, setW] = useState(640)
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, Math.round(e.contentRect.width))))
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref])
  return w
}

export default function IncomeChart({ data, country, start, year }) {
  const box = useRef(null)
  const width = useWidth(box)
  const height = width < 520 ? 220 : 260
  const m = { t: 18, r: width < 520 ? 16 : 120, b: 28, l: 48 }
  const [hover, setHover] = useState(null)

  const rows = useMemo(() => {
    const c0 = cpiAt(data, country, start)
    const i0 = incomeAt(data, country, start)
    const out = []
    for (let y = data.years[0]; y <= data.years[1]; y++) {
      const c = cpiAt(data, country, y)
      const i = incomeAt(data, country, y)
      out.push({
        y,
        price: c0 && c ? (c / c0) * 100 : null,
        income: i0 && i ? (i / i0) * 100 : null,
      })
    }
    return out
  }, [data, country, start])

  const vals = rows.flatMap((r) => [r.price, r.income]).filter((v) => v != null && v > 0)
  const ok = vals.length > 1 && rows.some((r) => r.y === start && r.price != null && r.income != null)

  const x = scaleLinear().domain(data.years).range([m.l, width - m.r])
  const lo = ok ? Math.min(...vals, 100) : 1
  const hi = ok ? Math.max(...vals, 100) : 1000
  const y = scaleLog()
    .domain([lo * 0.9, hi * 1.1])
    .range([height - m.b, m.t])
    .nice()

  const path = (key, from, to) => {
    let d = ''
    let pen = false
    for (const r of rows) {
      if (r.y < from || r.y > to || r[key] == null) {
        pen = false
        continue
      }
      d += `${pen ? 'L' : 'M'}${x(r.y).toFixed(1)},${y(r[key]).toFixed(1)}`
      pen = true
    }
    return d
  }

  const a = Math.min(start, year)
  const b = Math.max(start, year)
  const at = rows.find((r) => r.y === year)
  const yTicks = ok ? y.ticks(5).filter((t, i, arr) => arr.length < 7 || [1, 2, 5].includes(+String(t)[0])) : []
  const decades = []
  for (let d = Math.ceil(data.years[0] / 10) * 10; d <= data.years[1]; d += 10) decades.push(d)

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const yr = Math.round(x.invert(((e.clientX - r.left) / r.width) * width))
    const row = rows.find((q) => q.y === yr)
    setHover(row && (row.price != null || row.income != null) ? row : null)
  }

  const fmtIdx = (v) => (v == null ? 'no data' : fmtCount(v))
  const endLabel = (key, label, color) => {
    if (!at || at[key] == null || width < 520) return null
    return (
      <text x={x(year) + 10} y={y(at[key]) + 4} fill="var(--ink-2)" fontSize="12">
        <tspan fill={color}>●</tspan> {label} {fmtIdx(at[key])}
      </text>
    )
  }

  return (
    <figure className="chart" ref={box}>
      <figcaption>
        <span className="legend">
          <i style={{ background: PRICE }} /> Prices (consumer price index)
        </span>
        <span className="legend">
          <i style={{ background: INCOME }} /> Average income (GDP per capita)
        </span>
        <span className="muted">Both = 100 in {start} · log scale</span>
      </figcaption>
      {!ok ? (
        <div className="empty">No CPI or income data for {start} in {country.name}, so the lines can't be indexed. Pick another comparison year.</div>
      ) : (
        <svg width={width} height={height} onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img"
          aria-label={`Prices and average income in ${country.name}, indexed to ${start}`}>
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={m.l} x2={width - m.r} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
              <text x={m.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--ink-3)">
                {fmtCount(t)}
              </text>
            </g>
          ))}
          <line x1={m.l} x2={width - m.r} y1={y(100)} y2={y(100)} stroke="var(--ink-3)" strokeDasharray="3 4" opacity=".6" />
          {decades.map((d) => (
            <text key={d} x={x(d)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
              {width < 520 && d % 20 ? '' : d}
            </text>
          ))}
          <line x1={x(start)} x2={x(start)} y1={m.t} y2={height - m.b} stroke="var(--ink-3)" opacity=".35" />
          {/* full history, faint, for context */}
          <path d={path('price', data.years[0], data.years[1])} fill="none" stroke={PRICE} strokeWidth="1.5" opacity=".18" />
          <path d={path('income', data.years[0], data.years[1])} fill="none" stroke={INCOME} strokeWidth="1.5" opacity=".18" />
          {/* drawn segment */}
          <path d={path('price', a, b)} fill="none" stroke={PRICE} strokeWidth="2.25" strokeLinejoin="round" />
          <path d={path('income', a, b)} fill="none" stroke={INCOME} strokeWidth="2.25" strokeLinejoin="round" />
          {at?.price != null && <circle cx={x(year)} cy={y(at.price)} r="4.5" fill={PRICE} stroke="var(--surface)" strokeWidth="2" />}
          {at?.income != null && <circle cx={x(year)} cy={y(at.income)} r="4.5" fill={INCOME} stroke="var(--surface)" strokeWidth="2" />}
          {endLabel('price', 'Prices', PRICE)}
          {endLabel('income', 'Income', INCOME)}
          {hover && (
            <g pointerEvents="none">
              <line x1={x(hover.y)} x2={x(hover.y)} y1={m.t} y2={height - m.b} stroke="var(--ink-2)" opacity=".5" />
              {hover.price != null && <circle cx={x(hover.y)} cy={y(hover.price)} r="4" fill={PRICE} stroke="var(--surface)" strokeWidth="2" />}
              {hover.income != null && <circle cx={x(hover.y)} cy={y(hover.income)} r="4" fill={INCOME} stroke="var(--surface)" strokeWidth="2" />}
            </g>
          )}
        </svg>
      )}
      {hover && ok && (
        <div className="tooltip" style={{ left: Math.min(x(hover.y) + 12, width - 190) }}>
          <b>{hover.y}</b>
          <div><i style={{ background: PRICE }} /> Prices {fmtIdx(hover.price)}</div>
          <div><i style={{ background: INCOME }} /> Income {fmtIdx(hover.income)}</div>
          {hover.price && hover.income && (
            <div className="muted">Income bought {fmtCount(hover.income / hover.price)}× what it did in {start}</div>
          )}
        </div>
      )}
      {ok && (
        <details className="table-view">
          <summary>View as table</summary>
          <table>
            <thead>
              <tr><th>Year</th><th>Prices index</th><th>Income index</th></tr>
            </thead>
            <tbody>
              {rows.filter((r) => r.y % 5 === 0 || r.y === start || r.y === year).map((r) => (
                <tr key={r.y}><td>{r.y}</td><td>{fmtIdx(r.price)}</td><td>{fmtIdx(r.income)}</td></tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </figure>
  )
}
