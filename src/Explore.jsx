import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import Pile from './Pile.jsx'
import Timeline from './Timeline.jsx'
import IncomeChart from './IncomeChart.jsx'
import { ItemArt } from './Art.jsx'
import * as Icon from './Icons.jsx'
import { setDustStream } from './Particles.jsx'
import { downloadBlob, drawShareCard } from './share.js'
import {
  cpiAt, fmtCount, fmtHours, fmtMoney, fmtShareOfMonth, hourlyAt, incomeAt, itemNoun, kindLabel, latestYear, priceAt,
} from './data.js'

/** What `budget(year)` buys of each item in `year`. */
export function useCounts(data, country, budget, year) {
  return useMemo(() => {
    const prices = {}
    const counts = {}
    const money = budget(year)
    for (const it of data.items) {
      const p = priceAt(data, country, it.id, year)
      prices[it.id] = p
      counts[it.id] = p && p.value > 0 && money != null ? money / p.value : null
    }
    return { prices, counts, money }
  }, [data, country, budget, year])
}

export function ModeTabs({ active, go }) {
  return (
    <div className="tabs" role="tablist" aria-label="View">
      {[
        ['prices', 'Prices'],
        ['hours', 'Hours of work'],
        ['compare', 'Compare'],
      ].map(([id, label]) => (
        <button key={id} role="tab" aria-selected={active === id} className={active === id ? 'on' : ''} onClick={() => go(id)}>
          {label}
        </button>
      ))}
    </div>
  )
}

export function NumberInput({ value, onChange, max = 999999999, ...rest }) {
  return (
    <input
      inputMode="numeric"
      value={value.toLocaleString('en')}
      onChange={(e) => {
        const n = Number(e.target.value.replace(/[^\d]/g, '').slice(0, 9))
        onChange(Math.min(max, Math.max(1, n || 1)))
      }}
      {...rest}
    />
  )
}

export function CountrySelect({ data, value, onChange, ...rest }) {
  const sorted = [...data.countries].sort((a, b) => a.name.localeCompare(b.name))
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} {...rest}>
      {sorted.map((c) => (
        <option key={c.iso3} value={c.iso3}>
          {c.name} · {c.currency}
        </option>
      ))}
    </select>
  )
}

export default function Explore({ data, images, reduced, state, set, overrides }) {
  const { iso, amount, hours, year, ghostYear, mode } = state
  const country = data.countries.find((c) => c.iso3 === iso) ?? data.countries[0]
  const now = latestYear(data, country)
  const [minY, maxY] = data.years
  const isHours = mode === 'hours'
  const budget = useMemo(
    () => (isHours ? (y) => (hourlyAt(data, country, y) == null ? null : hours * hourlyAt(data, country, y)) : () => amount),
    [isHours, hours, amount, data, country],
  )
  const main = useCounts(data, country, budget, year)
  const ghost = useCounts(data, country, budget, ghostYear)
  const [sheet, setSheet] = useState(false)
  const [birthOpen, setBirthOpen] = useState(false)
  const pileWrap = useRef(null)
  const hero = useRef(null)

  // a faint drift of dust off the main pile, only while the hero is on screen
  useEffect(() => {
    if (reduced) return
    const src = () => {
      const el = pileWrap.current
      if (!el) return null
      const r = el.getBoundingClientRect()
      return new DOMRect(r.left + r.width * 0.64, r.top + r.height * 0.3, r.width * 0.1, r.height * 0.16)
    }
    const io = new IntersectionObserver(([e]) => setDustStream(e.isIntersecting ? src : null))
    io.observe(hero.current)
    return () => {
      io.disconnect()
      setDustStream(null)
    }
  }, [reduced])

  const hasAny = Object.values(main.counts).some((c) => c != null)
  const note = country.currencyNote && (year < country.currencyNote.before || ghostYear < country.currencyNote.before) ? country.currencyNote.text : null
  const amountText = amount.toLocaleString('en')
  const sym = country.symbol.trim()
  const what = isHours ? `${hours} hour${hours === 1 ? '' : 's'} of average work` : `${sym}${amountText}`
  const pileLabel = (yr, counts) =>
    `${what} in ${yr} buys: ` +
    data.items.map((it) => (counts[it.id] == null ? `${it.name}: no data` : `${fmtCount(counts[it.id])} ${it.plural}`)).join(', ')

  return (
    <>
      <section className="hero" ref={hero}>
        <div className="spotlight" aria-hidden="true" />

        <header className="hero-head">
          <p className="eyebrow">
            Purchasing power <span className="sep" /> {country.name}
          </p>
          <label className="big-number">
            {!isHours && <span className="sym">{sym}</span>}
            {/* the hidden copy of the text sizes the input to exactly its content */}
            <span className="autosize" data-value={(isHours ? hours : amount).toLocaleString('en')}>
              <NumberInput
                aria-label={isHours ? 'Hours of work' : `Amount in ${country.currency}`}
                value={isHours ? hours : amount}
                max={isHours ? 9999 : undefined}
                onChange={isHours ? set.hours : set.amount}
                size={1}
              />
            </span>
            {isHours && <span className="unit">{hours === 1 ? 'hour' : 'hours'}</span>}
          </label>
          <p className="caption">
            {isHours ? 'of average work buys you this in ' : 'buys you this in '}
            <AnimatePresence mode="popLayout" initial={false}>
              <m.span
                key={year}
                className="caption-year"
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {year}
              </m.span>
            </AnimatePresence>
          </p>
          {isHours && main.money != null && (
            <p className="subcap">One hour of average income in {year} ≈ {fmtMoney(country, main.money / hours)} (GDP per capita ÷ 2,080 h, a proxy, not a wage)</p>
          )}
          {!hasAny && <p className="subcap warn">No price data for {country.name} in {year}.</p>}
          <aside className={`dock glass${sheet ? ' open' : ''}`} aria-label="Controls">
            <button className="sheet-handle" onClick={() => setSheet((s) => !s)} aria-expanded={sheet}>
              <span className="grabber" /> {sheet ? 'Done' : 'Adjust'}
            </button>
            <div className="dock-body">
              <ModeTabs active={mode} go={set.mode} />
              <span className="dock-div" aria-hidden="true" />
              <div className="dock-field wide">
                <label htmlFor="country">Country</label>
                <CountrySelect id="country" data={data} value={country.iso3} onChange={set.iso} />
              </div>
              <div className="dock-field">
                <label htmlFor="amount">{isHours ? 'Hours' : country.currency}</label>
                <NumberInput id="amount" value={isHours ? hours : amount} max={isHours ? 9999 : undefined} onChange={isHours ? set.hours : set.amount} />
              </div>
              <div className="dock-field">
                <label htmlFor="ghost">Versus</label>
                <select id="ghost" value={ghostYear} onChange={(e) => set.ghostYear(Number(e.target.value))}>
                  {Array.from({ length: maxY - minY + 1 }, (_, i) => maxY - i).map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <span className="dock-div" aria-hidden="true" />
              <button className="dock-born" onClick={() => setBirthOpen(true)}>
                <Icon.Cake /> Born in…
              </button>
            </div>
          </aside>
        </header>

        <div className="stage">
          <div className="ghost-wrap">
            <div className="annotation">
              <span className="anno-year">{ghostYear}</span>
              <span className="anno-text">{isHours ? `the same ${hours === 1 ? 'hour' : 'hours'}` : `the same ${sym}${amountText}`}</span>
            </div>
            <Pile counts={ghost.counts} items={data.items} images={images} ghost reduced={reduced} label={pileLabel(ghostYear, ghost.counts)} />
          </div>
          <div className="main-wrap" ref={pileWrap}>
            <Pile counts={main.counts} items={data.items} images={images} reduced={reduced} label={pileLabel(year, main.counts)} />
          </div>
        </div>

        <div className="hero-cards">
          <Placard data={data} country={country} year={year} view={main} ghostView={ghost} ghostYear={ghostYear}
            images={images} mode={mode} overrides={overrides} setOverride={set.override} />
          {note && <p className="currency-note">{note}</p>}
        </div>
      </section>


      <Wages data={data} country={country} start={ghostYear} year={year} images={images} />

      <Timeline min={minY} max={maxY} value={year} onChange={set.year} ghostYear={ghostYear} nowYear={now} />

      <AnimatePresence>
        {birthOpen && (
          <BirthYear data={data} country={country} amount={amount} now={now} reduced={reduced} images={images}
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

const TAG = { observed: 'Measured', reference: 'Published', derived: 'Market', estimated: 'Estimate', yours: 'Yours' }
const SHORT_NAME = { bread: 'White bread', milk: 'Milk', fuel: 'Petrol', ticket: 'Cinema ticket', gold: 'Gold' }

/** A row of glass plaques: one per item with count, price, comparison and source tag. */
export function Placard({ data, country, year, view, ghostView, ghostYear, images, mode, overrides, setOverride }) {
  const [editing, setEditing] = useState(null)
  const hourly = hourlyAt(data, country, year)
  return (
    <div className="cards">
      {data.items.map((it) => {
        const p = view.prices[it.id]
        const c = view.counts[it.id]
        const g = ghostView?.counts[it.id]
        const mine = overrides?.[country.iso3]?.[it.id]
        const src = p && data.sources?.[p.source]?.name
        const price = p
          ? mode === 'hours'
            ? `${fmtHours(hourly ? p.value / hourly : null)} of work each`
            : `${fmtMoney(country, p.value)} each`
          : 'No source yet'
        return (
          <article key={it.id} className={`card${p ? '' : ' missing'}${editing === it.id ? ' editing' : ''}`}>
            <div className="card-top">
              <span className="card-art"><ItemArt id={it.id} images={images} /></span>
              <span className={`pl-tag t-${p?.kind ?? 'none'}`} title={p ? `${kindLabel(p)}${src ? ` · ${src}` : ''}` : 'No source for this item and country'}>
                {p ? TAG[p.kind] : 'No data'}
              </span>
            </div>
            <div className="card-num">{c == null ? '—' : fmtCount(c)}</div>
            <div className="card-name">{c == null ? SHORT_NAME[it.id] : itemNoun(it, c)}</div>
            <div className="card-meta">{price}</div>
            {ghostView && (
              <div className="card-ghost">
                <span>{ghostYear}</span> {g == null ? '—' : fmtCount(g)}
              </div>
            )}
            {setOverride && editing !== it.id && (
              <button className={`pl-edit${mine ? ' on' : ''}`} onClick={() => setEditing(it.id)}
                aria-label={`Use your own price for ${it.name}`} title={mine ? 'Edit your price' : 'Use your own local price'}>
                <Icon.Pencil size={13} />
              </button>
            )}
            {editing === it.id && (
              <PriceForm
                item={it}
                country={country}
                year={year}
                initial={mine?.year === year ? mine.value : p?.value}
                hasOwn={!!mine}
                onSave={(v) => {
                  setOverride(country.iso3, it.id, { year, value: v })
                  setEditing(null)
                }}
                onRemove={() => {
                  setOverride(country.iso3, it.id, null)
                  setEditing(null)
                }}
                onCancel={() => setEditing(null)}
              />
            )}
          </article>
        )
      })}
    </div>
  )
}

function PriceForm({ item, country, year, initial, hasOwn, onSave, onRemove, onCancel }) {
  const [val, setVal] = useState(initial ? String(Number(initial.toPrecision(4))) : '')
  const ref = useRef(null)
  useEffect(() => ref.current?.focus(), [])
  const n = Number(val)
  return (
    <form
      className="price-form"
      onSubmit={(e) => {
        e.preventDefault()
        if (n > 0) onSave(n)
      }}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
    >
      <label htmlFor={`own-${item.id}`}>
        Your price for {item.unit} in {year}
      </label>
      <div className="price-form-row">
        <span className="pf-cur">{country.currency}</span>
        <input id={`own-${item.id}`} ref={ref} inputMode="decimal" value={val} placeholder="0.00"
          onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ''))} />
        <button className="btn small" disabled={!(n > 0)}>Save</button>
        <button type="button" className="btn-text" onClick={onCancel}>Cancel</button>
      </div>
      <small>
        Saved only in this browser; other years are scaled from it with CPI.
        {hasOwn && (
          <>
            {' '}
            <button type="button" className="btn-text inline" onClick={onRemove}>Remove my price</button>
          </>
        )}
      </small>
    </form>
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
        <p className="eyebrow">Income <span className="sep" /> {start} to {year}</p>
        <h2>Did income keep up?</h2>
        <p className="proxy-note">
          “Average income” here is <b>GDP per capita</b>, a proxy for how much a country produces per person.
          It is not the same as a salary or take-home pay. <a href="#/methods">How this is measured</a>
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
        <p className="fine">Item prices marked “Estimate” are scaled from the nearest year with a measured price using the consumer price index.</p>
      )}

      <div className="stats">
        <div className="stat">
          <span className="stat-label">Average monthly income</span>
          <span className="stat-value">{fmtMoney(country, monthB, { digits: 0 })}</span>
          <span className="stat-sub">{year} · was {fmtMoney(country, monthA, { digits: monthA != null && monthA < 10 ? 2 : 0 })} in {start}</span>
        </div>
        <div className="stat">
          <span className="stat-label"><i className="key income" />Income grew</span>
          <span className="stat-value">{incX == null ? 'no data' : `${fmtCount(incX)}×`}</span>
          <span className="stat-sub">{start} → {year}</span>
        </div>
        <div className="stat">
          <span className="stat-label"><i className="key price" />Prices grew</span>
          <span className="stat-value">{cpiX == null ? 'no data' : `${fmtCount(cpiX)}×`}</span>
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
          <h3>Months of income to buy one</h3>
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
                    <td><span className="row-art"><ItemArt id={it.id} images={images} /></span>{it.name} <small>{it.unit}</small></td>
                    <td>{fmtShareOfMonth(ma)}</td>
                    <td>
                      {fmtShareOfMonth(mb)}
                      {better != null && (
                        <span className={`trend ${better ? 'up' : 'down'}`}>{better ? '↓ cheaper' : '↑ dearer'}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="fine">A month of income = GDP per capita ÷ 12. Days and hours are fractions of that month.</p>
        </div>
        <IncomeChart data={data} country={country} start={start} year={year} />
      </div>
    </section>
  )
}

function BirthYear({ data, country, amount, now, onClose, onApply, reduced, images }) {
  const [val, setVal] = useState('')
  const [shown, setShown] = useState(null)
  const [card, setCard] = useState(null) // { url, blob }
  const [busy, setBusy] = useState(false)
  const input = useRef(null)
  const list = useRef(null)
  const by = Number(val)
  const valid = by >= data.years[0] && by <= now

  useEffect(() => {
    input.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  useEffect(() => () => card && URL.revokeObjectURL(card.url), [card])

  const lines = shown
    ? data.items
        .map((it) => {
          const a = priceAt(data, country, it.id, shown)
          const b = priceAt(data, country, it.id, now)
          return a && b ? { it, a: amount / a.value, b: amount / b.value, est: a.kind === 'estimated' || b.kind === 'estimated' } : null
        })
        .filter(Boolean)
    : []
  const incA = shown ? incomeAt(data, country, shown) : null
  const incB = incomeAt(data, country, now)
  const cpiA = shown ? cpiAt(data, country, shown) : null
  const cpiB = cpiAt(data, country, now)
  const money = `${country.symbol.trim()}${amount.toLocaleString('en')}`
  const incomeLine = incA && incB && cpiA && cpiB
    ? `Since then average income (GDP per capita) grew ${fmtCount(incB / incA)}× while prices grew ${fmtCount(cpiB / cpiA)}×.`
    : ''

  const makeCard = async () => {
    setBusy(true)
    try {
      const els = list.current ? [...list.current.querySelectorAll('.by-art > *')] : []
      const blob = await drawShareCard({
        kicker: `The year I was born · ${country.name}`,
        big: money,
        sentence: `bought this in ${shown}. The arrow shows what the same money buys in ${now}.`,
        rows: lines.map((l, i) => ({ el: els[i], strong: fmtCount(l.a), text: itemNoun(l.it, l.a), note: `→ ${fmtCount(l.b)} in ${now}${l.est ? ' · includes CPI estimates' : ''}` })),
        footnote: `${incomeLine} Data: World Bank (CC BY 4.0), US BLS, UK ONS and cited reports. Estimates are labelled on the site.`,
      })
      if (card) URL.revokeObjectURL(card.url)
      setCard({ blob, url: URL.createObjectURL(blob) })
    } finally {
      setBusy(false)
    }
  }
  const fileName = `money-rewind-${country.iso3.toLowerCase()}-${shown}.png`
  const canShare = card && typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([card.blob], fileName, { type: 'image/png' })] })

  return (
    <m.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <m.div
        className="modal glass"
        role="dialog"
        aria-modal="true"
        aria-labelledby="by-title"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.32, ease: [0.2, 0.7, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-x" onClick={onClose} aria-label="Close"><Icon.Close /></button>
        <p className="eyebrow">Birth-year mode <span className="sep" /> {country.name}</p>
        <h2 id="by-title">The year you were born</h2>
        <form
          className="by-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!valid) return
            setShown(by)
            setCard(null)
            onApply(by)
          }}
        >
          <input ref={input} inputMode="numeric" placeholder="1998" value={val} aria-label="Birth year"
            onChange={(e) => setVal(e.target.value.replace(/[^\d]/g, '').slice(0, 4))} />
          <button className="btn" disabled={!valid}>Show me <Icon.Arrow /></button>
        </form>
        {val.length === 4 && !valid && <p className="fine">Pick a year between {data.years[0]} and {now}.</p>}
        {shown && (
          <div className="by-result">
            <p className="by-sentence">
              In <em>{shown}</em>, {money} bought
              {lines.length ? '' : ' … there is no price data for that year.'}
            </p>
            <ul ref={list}>
              {lines.map(({ it, a, b }) => (
                <li key={it.id}>
                  <span className="by-art"><ItemArt id={it.id} images={images} /></span>
                  <b>{fmtCount(a)}</b>
                  <span className="by-name">{itemNoun(it, a)}</span>
                  <span className="by-now">{fmtCount(b)} in {now}</span>
                </li>
              ))}
            </ul>
            {incomeLine && <p className="fine">{incomeLine}</p>}
            {lines.length > 0 && (
              <div className="share">
                {!card ? (
                  <button className="btn" onClick={makeCard} disabled={busy}>{busy ? 'Rendering…' : 'Create share image'}</button>
                ) : (
                  <>
                    <img className="share-preview" src={card.url} alt={`Share card: ${money} in ${country.name}, ${shown} vs ${now}`} />
                    <div className="share-actions">
                      <button className="btn" onClick={() => downloadBlob(card.blob, fileName)}><Icon.Download /> Download PNG</button>
                      {canShare && (
                        <button className="btn ghost" onClick={() => navigator.share({ files: [new File([card.blob], fileName, { type: 'image/png' })], title: 'Money Rewind' }).catch(() => {})}>
                          <Icon.Share /> Share
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            <p className="fine">The exhibit now shows {shown} (left, faded) against {now}.</p>
          </div>
        )}
      </m.div>
    </m.div>
  )
}
