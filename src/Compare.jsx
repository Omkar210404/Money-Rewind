import { useMemo } from 'react'
import Pile from './Pile.jsx'
import Timeline from './Timeline.jsx'
import { CountrySelect, ModeTabs, NumberInput, Placard, useCounts } from './Explore.jsx'
import * as Icon from './Icons.jsx'
import { fmtCount, fmtMoney, fxAt, hourlyAt, latestYear } from './data.js'

// Two countries side by side on one shared timeline. "Same money" converts
// country A's amount into B's currency at that year's official exchange rate;
// "Hours of work" gives each country the same hours of average work.

export default function Compare({ data, images, reduced, state, set }) {
  const { amount, hours, year, mode, compareA, compareB } = state
  const A = data.countries.find((c) => c.iso3 === compareA) ?? data.countries[0]
  const B = data.countries.find((c) => c.iso3 === compareB) ?? data.countries[1]
  const isHours = mode === 'hours'
  const [minY, maxY] = data.years
  const now = Math.min(latestYear(data, A), latestYear(data, B))

  const budgetA = useMemo(
    () => (isHours ? (y) => (hourlyAt(data, A, y) == null ? null : hours * hourlyAt(data, A, y)) : () => amount),
    [isHours, hours, amount, data, A],
  )
  const budgetB = useMemo(
    () =>
      isHours
        ? (y) => (hourlyAt(data, B, y) == null ? null : hours * hourlyAt(data, B, y))
        : (y) => {
            const fa = fxAt(data, A, y)
            const fb = fxAt(data, B, y)
            return fa && fb ? (amount * fb) / fa : null
          },
    [isHours, hours, amount, data, A, B],
  )
  const a = useCounts(data, A, budgetA, year)
  const b = useCounts(data, B, budgetB, year)

  const title = isHours
    ? `${hours} hour${hours === 1 ? '' : 's'} of average work`
    : `${A.symbol.trim()}${amount.toLocaleString('en')}`
  const notes = [A, B].filter((c) => c.currencyNote && year < c.currencyNote.before).map((c) => c.currencyNote.text)

  const side = (c, v, budgetLabel) => (
    <div className="cmp-side">
      <div className="cmp-label">
        <span className="cmp-country">{c.name}</span>
        <span className="cmp-budget">{budgetLabel}</span>
      </div>
      <Pile counts={v.counts} items={data.items} images={images} reduced={reduced}
        label={`${c.name} in ${year}: ` + data.items.map((it) => `${v.counts[it.id] == null ? 'no data' : fmtCount(v.counts[it.id])} ${it.plural}`).join(', ')} />
      <Placard data={data} country={c} year={year} view={v} images={images} mode={mode} />
    </div>
  )

  return (
    <>
      <section className="compare">
        <div className="spotlight two" aria-hidden="true" />
        <div className="cmp-head">
          <div>
            <p className="eyebrow">Compare countries <span className="sep" /> {year}</p>
            <h1 className="cmp-title">
              {title} <em>in {A.name}</em> vs <em>{isHours ? `in ${B.name}` : `the same money in ${B.name}`}</em>
            </h1>
          </div>
          <div className="cmp-controls glass">
            <ModeTabs active="compare" go={set.mode} />
            <div className="seg" role="group" aria-label="Compare by">
              <button className={!isHours ? 'on' : ''} aria-pressed={!isHours} onClick={() => set.compareBasis('prices')}>Same money</button>
              <button className={isHours ? 'on' : ''} aria-pressed={isHours} onClick={() => set.compareBasis('hours')}>Same hours of work</button>
            </div>
            <div className="cmp-row">
              <div className="field">
                <label htmlFor="cmp-a">Country A</label>
                <CountrySelect id="cmp-a" data={data} value={A.iso3} onChange={set.compareA} />
              </div>
              <button className="swap" onClick={set.swap} aria-label="Swap countries" title="Swap"><Icon.Swap /></button>
              <div className="field">
                <label htmlFor="cmp-b">Country B</label>
                <CountrySelect id="cmp-b" data={data} value={B.iso3} onChange={set.compareB} />
              </div>
              <div className="field narrow">
                <label htmlFor="cmp-amt">{isHours ? 'Hours' : `Amount (${A.currency})`}</label>
                <NumberInput id="cmp-amt" value={isHours ? hours : amount} max={isHours ? 9999 : undefined} onChange={isHours ? set.hours : set.amount} />
              </div>
            </div>
          </div>
        </div>

        <div className="cmp-stage">
          {side(A, a, isHours ? `${fmtMoney(A, a.money)} of income` : fmtMoney(A, a.money))}
          {side(B, b, b.money == null ? 'no exchange rate' : isHours ? `${fmtMoney(B, b.money)} of income` : `${fmtMoney(B, b.money)} at the ${year} rate`)}
        </div>

        <div className="cmp-table-wrap">
          <table className="cmp-table">
            <thead>
              <tr><th>In {year}</th><th>{A.name}</th><th>{B.name}</th><th>Ratio</th></tr>
            </thead>
            <tbody>
              {data.items.map((it) => {
                const x = a.counts[it.id]
                const y = b.counts[it.id]
                return (
                  <tr key={it.id}>
                    <td>{it.name} <small>({it.unit})</small></td>
                    <td>{x == null ? 'no data' : fmtCount(x)}</td>
                    <td>{y == null ? 'no data' : fmtCount(y)}</td>
                    <td>{x && y ? `${fmtCount(y / x)}× in ${B.name}` : '–'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className="fine">
            {isHours
              ? 'An hour of average work = GDP per capita ÷ 2,080 hours in each country. It reflects output per person, not what a typical worker earns.'
              : `${B.name}'s amount is ${A.name}'s converted at the ${year} official exchange rate (World Bank). Market rates ignore that everyday prices differ between countries, which is exactly what the piles show.`}
          </p>
          {notes.map((n) => <p key={n} className="fine">{n}</p>)}
        </div>
      </section>
      <Timeline min={minY} max={maxY} value={year} onChange={set.year} nowYear={now} />
    </>
  )
}
