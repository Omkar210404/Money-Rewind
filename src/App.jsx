import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'framer-motion'
import { ArtDefs, probeImages } from './Art.jsx'
import { ParticleCanvas } from './Particles.jsx'
import Explore from './Explore.jsx'
import { latestYear, loadData, read, store } from './data.js'

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
  const [prefs, setPrefs] = useState(() => read('mtm:prefs', { iso: 'IND', amounts: {}, ghostYear: 1990 }))
  const [year, setYear] = useState(null)

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

  const data = load.data
  const country = data && (data.countries.find((c) => c.iso3 === prefs.iso) ?? data.countries[0])
  const yr = data ? (year ?? latestYear(data, country)) : null
  const state = data && {
    iso: country.iso3,
    amount: prefs.amounts?.[country.iso3] ?? country.defaultAmount,
    year: yr,
    ghostYear: prefs.ghostYear ?? 1990,
  }
  const set = {
    iso: (iso) => setPrefs((p) => ({ ...p, iso })),
    amount: (n) => setPrefs((p) => ({ ...p, amounts: { ...p.amounts, [country.iso3]: n } })),
    year: setYear,
    ghostYear: (y) => setPrefs((p) => ({ ...p, ghostYear: y })),
  }

  useEffect(() => {
    document.title = route === 'methods' ? 'Methods & sources · Time Machine for Money' : route === 'compare' ? 'Compare · Time Machine for Money' : 'Time Machine for Money'
  }, [route])

  return (
    <MotionConfig reducedMotion="user">
      <ArtDefs />
      <div className="grain" aria-hidden="true" />
      <ParticleCanvas enabled={!reduced && route === 'explore' && load.status === 'ready'} />
      <TopBar route={route} online={online} load={load} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.main
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
            <Explore data={data} images={images} reduced={reduced} state={state} set={set} />
          )}
          {load.status === 'ready' && route === 'compare' && <ComparePlaceholder />}
          {load.status === 'ready' && route === 'methods' && (
            <Suspense fallback={<div className="methods"><div className="sk sk-line" /></div>}>
              <Methods data={data} />
            </Suspense>
          )}
        </motion.main>
      </AnimatePresence>
      <Footer data={data} />
    </MotionConfig>
  )
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true">
      <defs>
        <radialGradient id="lg" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f6dc9c" />
          <stop offset=".6" stopColor="#d9a54a" />
          <stop offset="1" stopColor="#8a6120" />
        </radialGradient>
      </defs>
      <circle cx="16" cy="16" r="13" fill="url(#lg)" />
      <path d="M11 9.5h10M11 22.5h10M12 9.5c0 4 8 4 8 6.5s-8 2.5-8 6.5M20 9.5c0 4-8 4-8 6.5s8 2.5 8 6.5" fill="none" stroke="#3b2a0e" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function TopBar({ route, online, load }) {
  const live = online && load.status === 'ready' && !load.fromCache
  const updated = load.data?.sources?.wb?.updated
  const nav = [
    ['explore', 'Explore'],
    ['compare', 'Compare'],
    ['methods', 'Methods'],
  ]
  return (
    <header className="topbar">
      <a className="skip" href="#main">Skip to content</a>
      <a href="#/" className="brand" aria-label="Time Machine for Money, home">
        <Logo />
        <span>Time Machine <i>for</i> Money</span>
      </a>
      <nav aria-label="Main">
        {nav.map(([id, label]) => (
          <a key={id} href={`#/${id}`} className={route === id ? 'active' : ''} aria-current={route === id ? 'page' : undefined}>
            {label}
            {route === id && <motion.span layoutId="nav-underline" className="nav-underline" />}
          </a>
        ))}
      </nav>
      <div className={`live${live ? ' on' : ''}`} title={updated ? `World Bank data last updated ${updated}` : ''}>
        <span className="dot" />
        {load.status === 'loading' ? 'Loading data' : live ? 'Live data' : 'Offline · saved data'}
        {updated && <span className="live-date">WB {updated}</span>}
      </div>
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
          <a href="https://www.ons.gov.uk/" target="_blank" rel="noreferrer">UK ONS</a> (OGL v3.0) and cited reports.{' '}
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

function ComparePlaceholder() {
  return (
    <section className="state-card glass">
      <p className="eyebrow">Compare countries</p>
      <h2>Two pedestals, one timeline.</h2>
      <p>Side-by-side countries with a shared slider are being built. Meanwhile, switch country on the Explore page.</p>
      <a className="btn-gold" href="#/">Back to Explore</a>
    </section>
  )
}
