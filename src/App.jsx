import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, domAnimation, LazyMotion, m, MotionConfig, useReducedMotion } from 'framer-motion'
import { ArtDefs, probeImages } from './Art.jsx'
import { ParticleCanvas } from './Particles.jsx'
import Explore from './Explore.jsx'
import Compare from './Compare.jsx'
import { Ticker, useLive } from './Live.jsx'
import { applyOverrides, latestYear, loadData, read, store } from './data.js'

const Methods = lazy(() => import('./Methods.jsx'))

const ROUTES = { '': 'explore', explore: 'explore', compare: 'compare', methods: 'methods' }
const routeFromHash = () => ROUTES[window.location.hash.replace(/^#\/?/, '').split('?')[0]] ?? 'explore'

function useRoute() {
  const [route, setRoute] = useState(routeFromHash)
  useEffect(() => {
    const on = () => {
      setRoute(routeFromHash())
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

function useOnline() {
  const [online, setOnline] = useState(() => navigator.onLine)
  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])
  return online
}

export default function App() {
  const route = useRoute()
  const online = useOnline()
  const reduced = !!useReducedMotion()
  const [load, setLoad] = useState({ status: 'loading' })
  const [images, setImages] = useState({})
  const [prefs, setPrefs] = useState(() => ({
    iso: 'IND', amounts: {}, ghostYear: 1990, mode: 'prices', hours: 1, compareA: 'IND', compareB: 'USA',
    ...read('mtm:prefs', {}),
  }))
  const [overrides, setOverrides] = useState(() => read('mtm:overrides', {}))
  const [year, setYear] = useState(null)
  const { live, fresh } = useLive()

  const fetchData = useCallback(() => {
    setLoad({ status: 'loading' })
    loadData()
      .then(({ data, fromCache }) => {
        setLoad({ status: 'ready', data, fromCache })
        probeImages().then(setImages)
      })
      .catch((error) => setLoad({ status: 'error', error }))
  }, [])

  useEffect(fetchData, [fetchData])
  useEffect(() => store('mtm:prefs', prefs), [prefs])
  useEffect(() => store('mtm:overrides', overrides), [overrides])

  const raw = load.data
  const data = useMemo(() => raw && applyOverrides(raw, overrides), [raw, overrides])
  const find = (iso, i = 0) => data.countries.find((c) => c.iso3 === iso) ?? data.countries[i]
  // on Compare the amount belongs to country A
  const country = data && (route === 'compare' ? find(prefs.compareA) : find(prefs.iso))
  const yr = data ? (year ?? latestYear(data, country)) : null
  const state = data && {
    iso: country.iso3,
    amount: prefs.amounts?.[country.iso3] ?? country.defaultAmount,
    hours: prefs.hours ?? 1,
    mode: prefs.mode === 'hours' ? 'hours' : 'prices',
    year: yr,
    ghostYear: prefs.ghostYear ?? 1990,
    compareA: prefs.compareA,
    compareB: prefs.compareB,
  }
  const set = {
    iso: (iso) => setPrefs((p) => ({ ...p, iso })),
    amount: (n) => setPrefs((p) => ({ ...p, amounts: { ...p.amounts, [country.iso3]: n } })),
    hours: (h) => setPrefs((p) => ({ ...p, hours: h })),
    year: setYear,
    ghostYear: (y) => setPrefs((p) => ({ ...p, ghostYear: y })),
    mode: (m) => {
      if (m === 'compare') {
        setPrefs((p) => ({ ...p, compareA: p.iso, compareB: p.iso === p.compareB ? p.compareA : p.compareB }))
        window.location.hash = '#/compare'
        return
      }
      setPrefs((p) => ({ ...p, mode: m, iso: route === 'compare' ? p.compareA : p.iso }))
      if (route !== 'explore') window.location.hash = '#/'
    },
    compareBasis: (m) => setPrefs((p) => ({ ...p, mode: m })),
    compareA: (iso) => setPrefs((p) => ({ ...p, compareA: iso, compareB: iso === p.compareB ? p.compareA : p.compareB })),
    compareB: (iso) => setPrefs((p) => ({ ...p, compareB: iso, compareA: iso === p.compareA ? p.compareB : p.compareA })),
    swap: () => setPrefs((p) => ({ ...p, compareA: p.compareB, compareB: p.compareA })),
    override: (iso, item, value) =>
      setOverrides((o) => {
        const next = { ...o, [iso]: { ...(o[iso] || {}) } }
        if (value) next[iso][item] = value
        else delete next[iso][item]
        if (!Object.keys(next[iso]).length) delete next[iso]
        return next
      }),
  }

  useEffect(() => {
    document.title = route === 'methods' ? 'Methods & sources · Time Machine for Money' : route === 'compare' ? 'Compare countries · Time Machine for Money' : 'Time Machine for Money'
  }, [route])

  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
      <ArtDefs />
      <div className="grain" aria-hidden="true" />
      <ParticleCanvas enabled={!reduced && route !== 'methods' && load.status === 'ready'} />
      <TopBar route={route} online={online} load={load} live={live} fresh={fresh} country={country} />
      <AnimatePresence mode="wait" initial={false}>
        <m.main
          key={route}
          id="main"
          className={`page page-${route}`}
          initial={{ opacity: 0, y: reduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : -8 }}
          transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
        >
          {load.status === 'loading' && <Skeleton />}
          {load.status === 'error' && <ErrorState onRetry={fetchData} />}
          {load.status === 'ready' && route === 'explore' && (
            <Explore data={data} images={images} reduced={reduced} state={state} set={set} overrides={overrides} />
          )}
          {load.status === 'ready' && route === 'compare' && (
            <Compare data={data} images={images} reduced={reduced} state={state} set={set} />
          )}
          {load.status === 'ready' && route === 'methods' && (
            <Suspense fallback={<div className="methods"><div className="sk sk-line" /></div>}>
              <Methods data={raw} overrides={overrides} />
            </Suspense>
          )}
        </m.main>
      </AnimatePresence>
      <Footer data={data} />
    </MotionConfig>
    </LazyMotion>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true" className="logo">
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="#d9a54a" strokeWidth="1" />
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="#d9a54a" strokeWidth=".6" opacity=".45" />
      <path d="M11.5 9.5h9M11.5 22.5h9M12.5 9.5c0 4 7 4.4 7 6.5s-7 2.5-7 6.5M19.5 9.5c0 4-7 4.4-7 6.5s7 2.5 7 6.5" fill="none" stroke="#f1e7d0" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M14 20.6h4l-2-2.2z" fill="#d9a54a" />
    </svg>
  )
}

function TopBar({ route, online, load, live: liveData, fresh, country }) {
  const live = online && fresh
  const updated = load.data?.sources?.wb?.updated
  const label =
    load.status === 'loading' ? 'Loading' : !online ? 'Offline' : live ? 'Live' : liveData ? 'Saved' : 'Connecting'
  const nav = [
    ['explore', 'Explore'],
    ['compare', 'Compare'],
    ['methods', 'Methods'],
  ]
  return (
    <header className="topbar">
      <div className="topbar-row">
      <a className="skip" href="#main">Skip to content</a>
      <a href="#/" className="brand" aria-label="Time Machine for Money, home">
        <Logo />
        <span>Time Machine <i>for</i> Money</span>
      </a>
      <nav aria-label="Main">
        {nav.map(([id, label]) => (
          <a key={id} href={`#/${id}`} className={route === id ? 'active' : ''} aria-current={route === id ? 'page' : undefined}>
            {label}
          </a>
        ))}
      </nav>
      <div className={`live${live ? ' on' : ''}`} title={`${live ? 'Live exchange rates and metal prices' : 'Showing saved values'}${updated ? ` · World Bank data updated ${updated}` : ''}`}>
        <span className="dot" />
        <span className="live-label">{label}</span>
        {updated && <span className="live-date">Data {new Date(updated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>
      </div>
      <Ticker live={liveData} fresh={live} country={country} />
    </header>
  )
}

function Footer({ data }) {
  return (
    <footer className="footer">
      <div>
        <b className="foot-brand">Time Machine for Money</b>
        <p>What everyday money buys across time, and whether income kept up.</p>
      </div>
      <div className="foot-sources">
        <p>
          Data: <a href="https://data.worldbank.org/" target="_blank" rel="noreferrer">World Bank</a> (CC BY 4.0),{' '}
          <a href="https://www.bls.gov/cpi/factsheets/average-prices.htm" target="_blank" rel="noreferrer">US BLS</a> (public domain),{' '}
          <a href="https://www.ons.gov.uk/" target="_blank" rel="noreferrer">UK ONS</a> (OGL v3.0) and cited reports. Live rates by{' '}
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noreferrer">ExchangeRate-API</a>, metals by{' '}
          <a href="https://gold-api.com" target="_blank" rel="noreferrer">gold-api.com</a>.{' '}
          <a href="#/methods">Methods & sources</a>
        </p>
        <p className="fine">{data ? `Data built ${data.generated}. ` : ''}Estimates are labelled. Average income is a GDP-per-capita proxy, not wages.</p>
      </div>
    </footer>
  )
}

function Skeleton() {
  return (
    <section className="hero skeleton" aria-busy="true" aria-label="Loading">
      <div className="hero-copy">
        <div className="sk sk-number" />
        <div className="sk sk-line" />
        <div className="sk sk-line short" />
      </div>
      <div className="stage">
        <div className="main-wrap"><div className="sk sk-pedestal" /></div>
      </div>
    </section>
  )
}

function ErrorState({ onRetry }) {
  return (
    <section className="state-card glass" role="alert">
      <p className="eyebrow">Couldn’t reach the data</p>
      <h2>The time machine needs its fuel.</h2>
      <p>We couldn’t load the price data and there is no saved copy on this device yet. Check your connection and try again.</p>
      <button className="btn-gold" onClick={onRetry}>Try again</button>
    </section>
  )
}
