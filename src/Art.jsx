// Shaded SVG stand-ins for the item photos. Gradients live once in <ArtDefs/>
// so dozens of objects on screen share them.

export function ArtDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="a-crust" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7b06a" />
          <stop offset=".45" stopColor="#b8722f" />
          <stop offset="1" stopColor="#5f3314" />
        </linearGradient>
        <radialGradient id="a-crust-hi" cx=".4" cy=".2" r=".6">
          <stop offset="0" stopColor="#ffe2ad" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffe2ad" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="a-carton" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9c3b5" />
          <stop offset=".35" stopColor="#f4efe3" />
          <stop offset="1" stopColor="#d9d2c2" />
        </linearGradient>
        <linearGradient id="a-carton-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8f8a80" />
          <stop offset="1" stopColor="#5b5850" />
        </linearGradient>
        <linearGradient id="a-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2f4f7f" />
          <stop offset=".4" stopColor="#4a72aa" />
          <stop offset="1" stopColor="#30507e" />
        </linearGradient>
        <linearGradient id="a-can" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a1e14" />
          <stop offset=".3" stopColor="#a5402a" />
          <stop offset=".6" stopColor="#8c3221" />
          <stop offset="1" stopColor="#4a1810" />
        </linearGradient>
        <linearGradient id="a-ticket" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e8cf" />
          <stop offset="1" stopColor="#d6c6a2" />
        </linearGradient>
        <radialGradient id="a-gold" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#fff0bf" />
          <stop offset=".35" stopColor="#e5b955" />
          <stop offset=".75" stopColor="#b5832b" />
          <stop offset="1" stopColor="#7d5719" />
        </radialGradient>
        <linearGradient id="a-gold-edge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6e4c14" />
          <stop offset=".4" stopColor="#c99a3e" />
          <stop offset="1" stopColor="#5e3f10" />
        </linearGradient>
        <linearGradient id="a-note" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe4c8" />
          <stop offset="1" stopColor="#cbb98f" />
        </linearGradient>
        {/* pedestal */}
        <linearGradient id="a-ped-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#14161b" />
          <stop offset=".28" stopColor="#4b4a47" />
          <stop offset=".45" stopColor="#5d5b56" />
          <stop offset=".75" stopColor="#2a2c31" />
          <stop offset="1" stopColor="#0f1116" />
        </linearGradient>
        <linearGradient id="a-ped-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#05070c" stopOpacity=".75" />
        </linearGradient>
        <radialGradient id="a-ped-top" cx=".48" cy=".35" r=".7">
          <stop offset="0" stopColor="#8e8a80" />
          <stop offset=".55" stopColor="#5f5c56" />
          <stop offset="1" stopColor="#34363b" />
        </radialGradient>
        <radialGradient id="a-floor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".75" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="a-stone" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .55 -.12" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="a-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
      </defs>
    </svg>
  )
}

const Bread = () => (
  <svg viewBox="0 0 100 56" aria-hidden="true">
    <ellipse cx="50" cy="53" rx="44" ry="3" fill="#000" opacity=".35" />
    <path d="M6 44C4 28 12 11 30 8c10-4 30-4 40 0 18 3 26 20 24 36 0 7-6 9-14 9H20C12 53 6 51 6 44Z" fill="url(#a-crust)" />
    <path d="M6 44C4 28 12 11 30 8c10-4 30-4 40 0 18 3 26 20 24 36 0 7-6 9-14 9H20C12 53 6 51 6 44Z" fill="url(#a-crust-hi)" />
    <g fill="none" stroke="#f3cf92" strokeWidth="2.2" strokeLinecap="round" opacity=".55">
      <path d="M26 15q7 6 4 17" />
      <path d="M44 11q7 7 4 19" />
      <path d="M62 11q7 7 4 19" />
      <path d="M78 16q5 5 3 14" />
    </g>
    <path d="M8 44c20 4 64 4 84 0" stroke="#3d200b" strokeWidth="2" opacity=".5" fill="none" />
  </svg>
)

const Milk = () => (
  <svg viewBox="0 0 54 100" aria-hidden="true">
    <ellipse cx="27" cy="97" rx="24" ry="2.5" fill="#000" opacity=".35" />
    <polygon points="38,30 50,25 50,91 38,96" fill="url(#a-carton-side)" />
    <rect x="4" y="30" width="34" height="66" fill="url(#a-carton)" />
    <polygon points="4,30 38,30 21,15" fill="#e6e0d2" />
    <polygon points="21,15 38,30 50,25 33,11" fill="#a9a497" />
    <polygon points="19,10 33,6 33,11 21,15" fill="#d8d2c4" />
    <rect x="4" y="54" width="34" height="18" fill="url(#a-band)" />
    <polygon points="38,54 50,50 50,67 38,72" fill="#22385a" />
    <path d="M21 58c-3 4-4 6-4 8a4 4 0 0 0 8 0c0-2-1-4-4-8Z" fill="#e9f0fa" opacity=".9" />
    <rect x="6" y="32" width="3" height="62" fill="#fff" opacity=".35" />
  </svg>
)

const Fuel = () => (
  <svg viewBox="0 0 80 92" aria-hidden="true">
    <ellipse cx="40" cy="89" rx="36" ry="3" fill="#000" opacity=".4" />
    <path d="M62 18l10-4v68l-10 6Z" fill="#3a130c" />
    <rect x="8" y="16" width="56" height="72" rx="6" fill="url(#a-can)" />
    <path d="M14 24l44 56M58 24L14 80" stroke="#c4583d" strokeWidth="3" opacity=".55" />
    <path d="M14 26l44 56M58 26L14 82" stroke="#3b120a" strokeWidth="2" opacity=".5" />
    <rect x="13" y="5" width="30" height="14" rx="4" fill="#7c2c1d" />
    <rect x="18" y="9" width="8" height="6" rx="2" fill="#1d0905" />
    <rect x="30" y="9" width="8" height="6" rx="2" fill="#1d0905" />
    <path d="M48 16l4-11h10l2 11Z" fill="#5c2116" />
    <rect x="50" y="2" width="12" height="5" rx="1.5" fill="#2b2b2e" />
    <rect x="11" y="20" width="4" height="64" rx="2" fill="#fff" opacity=".18" />
  </svg>
)

const Ticket = () => (
  <svg viewBox="0 0 100 46" aria-hidden="true">
    <ellipse cx="50" cy="44" rx="46" ry="2" fill="#000" opacity=".35" />
    <path d="M4 4h92v13a6 6 0 0 0 0 12v13H4V29a6 6 0 0 0 0-12Z" fill="url(#a-ticket)" />
    <path d="M10 9h62v24H10Z" fill="none" stroke="#b18a45" strokeWidth="1" opacity=".7" />
    <text x="41" y="25" textAnchor="middle" fontFamily="Fraunces Variable, serif" fontSize="9" fontWeight="600" fill="#6c4d1c" letterSpacing="1.2">
      ADMIT ONE
    </text>
    <path d="M77 6v34" stroke="#8f7446" strokeWidth="1.2" strokeDasharray="2 2.5" />
    <circle cx="87" cy="23" r="5" fill="none" stroke="#b18a45" strokeWidth="1.2" />
    <rect x="4" y="4" width="92" height="3" fill="#fff" opacity=".35" />
  </svg>
)

const Gold = () => (
  <svg viewBox="0 0 60 40" aria-hidden="true">
    <ellipse cx="30" cy="34" rx="28" ry="5" fill="#000" opacity=".35" />
    <path d="M2 17v8c0 6.6 12.5 12 28 12s28-5.4 28-12v-8Z" fill="url(#a-gold-edge)" />
    <path d="M2 21c0 6.6 12.5 12 28 12s28-5.4 28-12" stroke="#5a3d0e" strokeWidth=".8" fill="none" opacity=".6" />
    <ellipse cx="30" cy="17" rx="28" ry="12" fill="url(#a-gold)" />
    <ellipse cx="30" cy="17" rx="21" ry="8.6" fill="none" stroke="#8a6120" strokeWidth="1.2" opacity=".6" />
    <ellipse cx="30" cy="17" rx="21" ry="8.6" fill="none" stroke="#fff3c6" strokeWidth=".6" opacity=".6" transform="translate(0 .8)" />
    <text x="30" y="20.5" textAnchor="middle" fontFamily="Fraunces Variable, serif" fontSize="8.5" fontWeight="700" fill="#7a5418" opacity=".85">
      1g
    </text>
  </svg>
)

export const Note = () => (
  <svg viewBox="0 0 120 60" aria-hidden="true">
    <rect x="2" y="2" width="116" height="56" rx="4" fill="url(#a-note)" />
    <rect x="8" y="8" width="104" height="44" rx="2" fill="none" stroke="#9c8250" strokeWidth="1" opacity=".7" />
    <circle cx="90" cy="30" r="14" fill="none" stroke="#9c8250" strokeWidth="1" opacity=".6" />
    <circle cx="90" cy="30" r="9" fill="none" stroke="#9c8250" strokeWidth=".8" opacity=".5" />
    <path d="M16 20h40M16 26h30M16 40h22" stroke="#9c8250" strokeWidth="1.6" opacity=".55" strokeLinecap="round" />
  </svg>
)

const ART = { bread: Bread, milk: Milk, fuel: Fuel, ticket: Ticket, gold: Gold }

/** Photo if public/items/<file>.png exists, otherwise the SVG above. */
export const IMAGE_FILE = { bread: 'bread', milk: 'milk', fuel: 'fuel', ticket: 'ticket', gold: 'coin', note: 'note' }

export function ItemArt({ id, images }) {
  if (images?.[id]) return <img src={images[id]} alt="" draggable="false" />
  const A = id === 'note' ? Note : ART[id]
  return A ? <A /> : null
}

/** Checks which optional PNGs are present without blocking anything. */
export function probeImages() {
  return Promise.all(
    Object.entries(IMAGE_FILE).map(
      ([id, file]) =>
        new Promise((resolve) => {
          const img = new Image()
          const src = `./items/${file}.png`
          img.onload = () => resolve([id, src])
          img.onerror = () => resolve([id, null])
          img.src = src
        }),
    ),
  ).then((pairs) => Object.fromEntries(pairs.filter(([, v]) => v)))
}

export function Pedestal({ ghost }) {
  return (
    <svg className="pedestal" viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <ellipse cx="280" cy="362" rx="270" ry="34" fill="url(#a-floor)" />
      <path d="M80 190v160a200 30 0 0 0 400 0V190Z" fill="url(#a-ped-body)" />
      <path d="M80 190v160a200 30 0 0 0 400 0V190Z" fill="#000" filter="url(#a-stone)" opacity=".5" />
      <path d="M80 190v160a200 30 0 0 0 400 0V190Z" fill="url(#a-ped-shade)" />
      <path d="M80 204a200 30 0 0 0 400 0" fill="none" stroke="#000" strokeWidth="6" opacity=".25" />
      <ellipse cx="280" cy="190" rx="200" ry="34" fill="url(#a-ped-top)" />
      <ellipse cx="280" cy="190" rx="200" ry="34" fill="#000" filter="url(#a-stone)" opacity=".55" />
      <path d="M80 190a200 34 0 0 0 400 0" fill="none" stroke={ghost ? '#8fa6c9' : '#d9c79c'} strokeWidth="1.4" opacity=".55" />
      <ellipse cx="270" cy="182" rx="120" ry="16" fill="#fff4dc" opacity={ghost ? 0.04 : 0.09} filter="url(#a-soft)" />
    </svg>
  )
}
