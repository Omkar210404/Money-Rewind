import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Pile from './Pile.jsx'
import Timeline from './Timeline.jsx'
import IncomeChart from './IncomeChart.jsx'
import { ItemArt } from './Art.jsx'
import { setDustStream } from './Particles.jsx'
import {
  cpiAt, fmtCount, fmtMoney, fmtShareOfMonth, incomeAt, itemNoun, kindLabel, latestYear, priceAt,
} from './data.js'

function useCounts(data, country, amount, year) {
  return useMemo(() => {
    const prices = {}
    const counts = {}
    for (const it of data.items) {
      const p = priceAt(data, country, it.id, year)
      prices[it.id] = p
      counts[it.id] = p && p.value > 0 ? amount / p.value : null
    }
    return { prices, counts }
  }, [data, country, amount, year])
}

export default function Explore({ data, images, reduced, state, set }) {
  const { iso, amount, year, ghostYear } = state
  const country = data.countries.find((c) => c.iso3 === iso) ?? data.countries[0]
  const now = latestYear(data, country)
  const [minY, maxY] = data.years
  const main = useCounts(data, country, amount, year)
  const ghost = useCounts(data, country, amount, ghostYear)
  const [sheet, setSheet] = useState(false)
  const [birthOpen, setBirthOpen] = useState(false)
  const pileWrap = useRef(null)
  const hero = useRef(null)

  // a faint stream of dust from the right edge of the main pile, only while the hero is on screen
  useEffect(() => {
    if (reduced) return
    let on = false
    const src = () => {
      const el = pileWrap.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      return new DOMRect(r.left + r.width * 0.66, r.top + r.height * 0.3, r.width * 0.12, r.height * 0.18)
    }
    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting
      setDustStream(on ? src : null)
    })
    io.observe(hero.current)
    return () => {
      io.disconnect()
      setDustStream(null)
    }
  }, [reduced])

  const hasAny = Object.values(main.counts).some((c) => c != null)
  const note = country.currencyNote && (year < country.currencyNote.before || ghostYear < country.currencyNote.before) ? country.currencyNote.text : null

  const amountText = amount.toLocaleString('en')
  const pileLabel = (yr, counts) =>
    `${country.symbol}${amountText} in ${yr} buys: ` +
    data.items.map((it) => (counts[it.id] == null ? `${it.name}: no data` : `${fmtCount(counts[it.id])} ${it.plural}`)).join(', ')

  return (
    <>
      <section className="hero" ref={hero}>
        <div className="spotlight" aria-hidden="true" />
        <div className="hero-copy">
          <label className="big-number">
            <span className="sym">{country.symbol}</span>
            <input
              aria-label={`Amount in ${country.currency}`}
              inputMode="numeric"
              value={amountText}
              style={{ width: `${Math.max(2, amountText.length) * 0.62 + 0.1}em` }}
              onChange={(e) => {
                const n = Number(e.target.value.replace(/[^\d]/g, '').slice(0, 9))
                set.amount(n > 0 ? n : 1)
              }}
            />
          </label>
          <p className="caption">
            buys you this in{' '}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={year}
                className="caption-year"
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
              >
                {year}
              </motion.span>
            </AnimatePresence>
          </p>
          <p className="sublabel">
            {country.name} · {country.currency}
            {!hasAny && <span className="nodata-pill">no data for {year}</span>}
          </p>
        </div>

        <div className="stage">
          <div className="ghost-wrap">
            <div className="annotation">
              <span className="anno-year">{ghostYear}</span>
              <span className="anno-text">the same {country.symbol}{amountText} bought</span>
              <span className="anno-line" aria-hidden="true" />
            </div>
            <Pile counts={ghost.counts} items={data.items} images={images} ghost reduced={reduced} label={pileLabel(ghostYear, ghost.counts)} />
          </div>
          <div className="main-wrap" ref={pileWrap}>
            <Pile counts={main.counts} items={data.items} images={images} reduced={reduced} label={pileLabel(year, main.counts)} />
          </div>
        </div>

        <aside className={`panel glass${sheet ? ' open' : ''}`} aria-label="Controls">
          <button className="sheet-handle" onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
            <span /> {sheet ? 'Close' : 'Controls & details'}
          </button>
          <div className="panel-body">
            <div className="seg" role="group" aria-label="View">
              <button className="on" aria-pressed="true">Prices</button>
              <button disabled title="Coming soon">Hours of work</button>
              <button disabled title="Coming soon">Compare countries</button>
            </div>
            <div className="field">
              <label htmlFor="country">Country</label>
              <select id="country" value={country.iso3} onChange={(e) => set.iso(e.target.value)}>
                {data.countries.map((c) => (
                  <option key={c.iso3} value={c.iso3}>
                    {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div className="field-row">
              <div className="field">
                <label htmlFor="amount">Amount</label>
                <input id="amount" inputMode="numeric" value={amountText}
                  onChange={(e) => set.amount(Math.max(1, Number(e.target.value.replace(/[^\d]/g, '').slice(0, 9)) || 1))} />
              </div>
              <div className="field">
                <label htmlFor="ghost">Compare with</label>
                <select id="ghost" value={ghostYear} onChange={(e) => set.ghostYear(Number(e.target.value))}>
                  {Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
            <button className="btn-ghost" onClick={() => setBirthOpen(true)}>
              ✦ Born in…? See then vs now
            </button>
            <Ledger data={data} country={country} amount={amount} year={year} main={main} images={images} />
          </div>
        </aside>

        {note && <p className="currency-note">{note}</p>}
      </section>

      <Wages data={data} country={country} start={ghostYear} year={year} images={images} />

      <Timeline min={minY} max={maxY} value={year} onChange={set.year} ghostYear={ghostYear} nowYear={now} />

      <AnimatePresence>
        {birthOpen && (
          <BirthYear data={data} country={country} amount={amount} now={now} reduced={reduced}
            onClose={() => setBirthOpen(false)}
            onApply={(by) => {
              set.ghostYear(by)
              set.year(now)
            }} />
        )}
      </AnimatePresence>
    </>
  )
}

function Ledger({ data, country, amount, year, main, images }) {
  return (
    <div className="ledger">
      <h3>In {year}, {country.symbol}{amount.toLocaleString('en')} buys</h3>
      <ul>
        {data.items.map((it) => {
          const p = main.prices[it.id]
          const c = main.counts[it.id]
          return (
            <li key={it.id} className={p ? '' : 'missing'}>
              <span className="ledger-art"><ItemArt id={it.id} images={images} /></span>
              <span className="ledger-main">
                <b>{c == null ? 'no data' : fmtCount(c)}</b> {c == null ? it.name.toLowerCase() : itemNoun(it, c)}
                <small>
                  {p ? `${fmtMoney(country, p.value)} per ${it.unit} · ${kindLabel(p)}` : 'no price source yet'}
                </small>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Wages({ data, country, start, year, images }) {
  const firstWithData = data.items.find((it) => priceAt(data, country, it.id, start) && priceAt(data, country, it.id, year))
  const [focus, setFocus] = useState(firstWithData?.id ?? 'gold')
  const item = data.items.find((i) => i.id === focus) ?? data.items[0]
  useEffect(() => {
    if (!priceAt(data, country, focus, year) && firstWithData) setFocus(firstWithData.id)
  }, [country.iso3]) // eslint-disable-line react-hooks/exhaustive-deps

  const incA = incomeAt(data, country, start)
  const incB = incomeAt(data, country, year)
  const cpiA = cpiAt(data, country, start)
  const cpiB = cpiAt(data, country, year)
  const monthA = incA != null ? incA / 12 : null
  const monthB = incB != null ? incB / 12 : null
  const pA = priceAt(data, country, item.id, start)
  const pB = priceAt(data, country, item.id, year)
  const qA = monthA != null && pA ? monthA / pA.value : null
  const qB = monthB != null && pB ? monthB / pB.value : null
  const incX = incA && incB ? incB / incA : null
  const cpiX = cpiA && cpiB ? cpiB / cpiA : null

  return (
    <section className="wages" id="wages">
      <div className="wages-head">
        <p className="eyebrow">The second layer</p>
        <h2>Did income keep up?</h2>
        <p className="proxy-note">
          “Average income” here is <b>GDP per capita</b>, a proxy for how much a country produces per person.
          It is not the same as a salary or take-home pay. See <a href="#/methods">Methods</a>.
        </p>
      </div>

      <div className="item-chips" role="group" aria-label="Item for the income sentence">
        {data.items.map((it) => (
          <button key={it.id} aria-pressed={focus === it.id} className={focus === it.id ? 'on' : ''} onClick={() => setFocus(it.id)}>
            <span className="chip-art"><ItemArt id={it.id} images={images} /></span>
            {it.name}
          </button>
        ))}
      </div>

      <p className="sentence">
        In <em>{start}</em>, a month of average income bought{' '}
        <strong>{qA == null ? 'no data' : `${fmtCount(qA)} ${itemNoun(item, qA)}`}</strong>.{' '}
        In <em>{year}</em>, it buys <strong>{qB == null ? 'no data' : `${fmtCount(qB)} ${itemNoun(item, qB)}`}</strong>.
        {qA != null && qB != null && (
          <span className="verdict"> {qB >= qA ? `That is ${fmtCount(qB / qA)}× as much.` : `That is ${fmtCount((1 - qB / qA) * 100)}% less.`}</span>
        )}
      </p>
      {(pA?.kind === 'estimated' || pB?.kind === 'estimated') && (
        <p className="fine">Item prices marked “estimated from CPI” are scaled from the nearest year with a measured price.</p>
      )}

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Average monthly income</span>
          <span className="stat-value">{fmtMoney(country, monthB, { digits: 0 })}</span>
          <span className="stat-sub">{year} · was {fmtMoney(country, monthA, { digits: monthA != null && monthA < 10 ? 2 : 0 })} in {start}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Income grew</span>
          <span className="stat-value income">{incX == null ? 'no data' : `${fmtCount(incX)}×`}</span>
          <span className="stat-sub">{start} → {year}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Prices grew</span>
          <span className="stat-value price">{cpiX == null ? 'no data' : `${fmtCount(cpiX)}×`}</span>
          <span className="stat-sub">consumer price index</span>
        </div>
        <div className="stat">
          <span className="stat-label">Real change in income</span>
          <span className="stat-value">{incX && cpiX ? `${incX / cpiX >= 1 ? '+' : ''}${fmtCount((incX / cpiX - 1) * 100)}%` : 'no data'}</span>
          <span className="stat-sub">income growth after prices</span>
        </div>
      </div>

      <div className="wages-grid">
        <div className="months">
          <h3>Months of income to buy one…</h3>
          <table>
            <thead>
              <tr><th>Item</th><th>{start}</th><th>{year}</th></tr>
            </thead>
            <tbody>
              {data.items.map((it) => {
                const a = priceAt(data, country, it.id, start)
                const b = priceAt(data, country, it.id, year)
                const ma = a && monthA ? a.value / monthA : null
                const mb = b && monthB ? b.value / monthB : null
                const better = ma != null && mb != null ? mb < ma : null
                return (
                  <tr key={it.id}>
                    <td><span className="row-art"><ItemArt id={it.id} images={images} /></span>{it.name} <small>({it.unit})</small></td>
                    <td>{fmtShareOfMonth(ma)}</td>
                    <td>
                      {fmtShareOfMonth(mb)}
                      {better != null && (
                        <span className={`trend ${better ? 'up' : 'down'}`} title={better ? 'More affordable' : 'Less affordable'}>
                          {better ? '▼ cheaper' : '▲ dearer'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="fine">A month of income = GDP per capita ÷ 12. “Days” and “hours” are fractions of that month.</p>
        </div>
        <IncomeChart data={data} country={country} start={start} year={year} />
      </div>
    </section>
  )
}

function BirthYear({ data, country, amount, now, onClose, onApply, reduced }) {
  const [val, setVal] = useState('')
  const [shown, setShown] = useState(null)
  const input = useRef(null)
  const by = Number(val)
  const valid = by >= data.years[0] && by <= now

  useEffect(() => {
    input.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const lines = shown
    ? data.items
        .map((it) => {
          const a = priceAt(data, country, it.id, shown)
          const b = priceAt(data, country, it.id, now)
          return a && b ? { it, a: amount / a.value, b: amount / b.value } : null
        })
        .filter(Boolean)
    : []
  const incA = shown ? incomeAt(data, country, shown) : null
  const incB = incomeAt(data, country, now)
  const cpiA = shown ? cpiAt(data, country, shown) : null
  const cpiB = cpiAt(data, country, now)

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="by-title"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-x" onClick={onClose} aria-label="Close">×</button>
        <p className="eyebrow">Birth-year mode</p>
        <h2 id="by-title">The year you were born</h2>
        <form
          className="by-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valid) return
            setShown(by)
            onApply(by)
          }}
        >
          <input ref={input} inputMode="numeric" placeholder="e.g. 1998" value={val} aria-label="Birth year"
            onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} />
          <button className="btn-gold" disabled={!valid}>Show me</button>
        </form>
        {val.length === 4 && !valid && <p className="fine">Pick a year between {data.years[0]} and {now}.</p>}
        {shown && (
          <div className="by-result">
            <p className="by-sentence">
              The year you were born, <em>{shown}</em>, {country.symbol}{amount.toLocaleString('en')} in {country.name} bought
              {lines.length ? '' : ' … we have no price data for that year.'}
            </p>
            <ul>
              {lines.map(({ it, a, b }) => (
                <li key={it.id}>
                  <b>{fmtCount(a)}</b> {itemNoun(it, a)} <span className="muted">→ {fmtCount(b)} in {now}</span>
                </li>
              ))}
            </ul>
            {incA && incB && cpiA && cpiB && (
              <p className="fine">
                Since then average income (GDP per capita) grew {fmtCount(incB / incA)}× while prices grew {fmtCount(cpiB / cpiA)}×.
              </p>
            )}
            <p className="fine">The pedestals now show {shown} (ghost) against {now}. A shareable image card is coming next.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
