// Exhibit objects: everyday things cast in ivory porcelain with gilt details,
// lit from above (warm) with a cool blue fill from the right. Gold stays gold.
// Gradients live once in <ArtDefs/> so dozens of objects share them.

export function ArtDefs() {
  return (
    <svg id="art-defs" width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {/* porcelain */}
        <linearGradient id="p-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d2c4" />
          <stop offset=".22" stopColor="#f7f1e4" />
          <stop offset=".45" stopColor="#ebe3d3" />
          <stop offset=".78" stopColor="#a8a59f" />
          <stop offset="1" stopColor="#5d6474" />
        </linearGradient>
        <linearGradient id="p-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3ecdf" />
          <stop offset=".6" stopColor="#ddd5c6" />
          <stop offset="1" stopColor="#a39e94" />
        </linearGradient>
        <linearGradient id="p-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8e8f93" />
          <stop offset="1" stopColor="#4f5665" />
        </linearGradient>
        <linearGradient id="p-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fffbf2" />
          <stop offset="1" stopColor="#e6dccb" />
        </linearGradient>
        <radialGradient id="p-dome" cx=".38" cy=".25" r=".85">
          <stop offset="0" stopColor="#fffcf5" />
          <stop offset=".45" stopColor="#ece3d2" />
          <stop offset=".85" stopColor="#b3ada2" />
          <stop offset="1" stopColor="#7d808a" />
        </radialGradient>
        <radialGradient id="p-spec" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fff" stopOpacity=".85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="contact" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".55" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        {/* baked crust */}
        <linearGradient id="r-crust-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c98a45" />
          <stop offset=".45" stopColor="#a5652b" />
          <stop offset="1" stopColor="#6e3d17" />
        </linearGradient>
        <radialGradient id="r-crust-hi" cx=".35" cy=".25" r=".7">
          <stop offset="0" stopColor="#f2c88c" stopOpacity=".75" />
          <stop offset="1" stopColor="#f2c88c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="r-crust-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b9874f" />
          <stop offset=".25" stopColor="#e2b67c" />
          <stop offset=".6" stopColor="#c99357" />
          <stop offset="1" stopColor="#6d4a2c" />
        </linearGradient>
        {/* glass + milk */}
        <linearGradient id="r-milk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9d8d3" />
          <stop offset=".3" stopColor="#fbfaf6" />
          <stop offset=".65" stopColor="#ecebe6" />
          <stop offset="1" stopColor="#9fa6b3" />
        </linearGradient>
        <linearGradient id="r-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cfe1ea" stopOpacity=".35" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity=".08" />
          <stop offset="1" stopColor="#9fb6c8" stopOpacity=".3" />
        </linearGradient>
        <linearGradient id="r-foil" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2c4f86" />
          <stop offset=".35" stopColor="#7ea2d6" />
          <stop offset=".7" stopColor="#3b65a3" />
          <stop offset="1" stopColor="#1d355d" />
        </linearGradient>
        {/* enamelled steel can */}
        <linearGradient id="r-can" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a140e" />
          <stop offset=".22" stopColor="#a7311f" />
          <stop offset=".4" stopColor="#c4472f" />
          <stop offset=".62" stopColor="#8e2618" />
          <stop offset="1" stopColor="#3f0d08" />
        </linearGradient>
        <linearGradient id="r-can-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5e160e" />
          <stop offset="1" stopColor="#2a0805" />
        </linearGradient>
        <linearGradient id="r-can-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9573b" />
          <stop offset="1" stopColor="#8f2719" />
        </linearGradient>
        <linearGradient id="r-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a3d44" />
          <stop offset=".4" stopColor="#a9adb5" />
          <stop offset="1" stopColor="#2b2e34" />
        </linearGradient>
        {/* ticket card */}
        <linearGradient id="r-card" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6eedb" />
          <stop offset="1" stopColor="#d8c9a7" />
        </linearGradient>
        <linearGradient id="r-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8322b" />
          <stop offset="1" stopColor="#6e1a17" />
        </linearGradient>
        {/* gilt */}
        <linearGradient id="g-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff0c0" />
          <stop offset=".28" stopColor="#e9c264" />
          <stop offset=".62" stopColor="#b9882c" />
          <stop offset="1" stopColor="#6c4a12" />
        </linearGradient>
        <linearGradient id="g-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff7dc" />
          <stop offset=".5" stopColor="#f0cd78" />
          <stop offset="1" stopColor="#c7973a" />
        </linearGradient>
        <linearGradient id="g-side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a6c1e" />
          <stop offset="1" stopColor="#4a320b" />
        </linearGradient>
        <linearGradient id="g-round" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a87a26" />
          <stop offset=".3" stopColor="#f7dc95" />
          <stop offset=".7" stopColor="#c19136" />
          <stop offset="1" stopColor="#5e400e" />
        </linearGradient>
        <linearGradient id="a-note" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#efe7d6" />
          <stop offset="1" stopColor="#bfb49b" />
        </linearGradient>
        {/* pedestal */}
        <linearGradient id="a-ped-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#121419" />
          <stop offset=".25" stopColor="#3d3d3d" />
          <stop offset=".42" stopColor="#57554f" />
          <stop offset=".7" stopColor="#272a31" />
          <stop offset="1" stopColor="#0d1016" />
        </linearGradient>
        <linearGradient id="a-ped-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#05070c" stopOpacity=".8" />
        </linearGradient>
        <radialGradient id="a-ped-top" cx=".46" cy=".3" r=".75">
          <stop offset="0" stopColor="#8a867c" />
          <stop offset=".5" stopColor="#5b5953" />
          <stop offset="1" stopColor="#2f3238" />
        </radialGradient>
        <linearGradient id="a-bevel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#2a2c31" />
          <stop offset=".35" stopColor="#8d877a" />
          <stop offset=".55" stopColor="#6d6a63" />
          <stop offset="1" stopColor="#1c1f25" />
        </linearGradient>
        <radialGradient id="a-floor" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#000" stopOpacity=".8" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <filter id="a-stone" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .5 -.12" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <filter id="a-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
      </defs>
    </svg>
  )
}

const Contact = ({ cx, cy, rx, ry = 2.6 }) => <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity=".42" filter="url(#a-soft)" />

/** Baked tin loaf: golden crust, a pale split along the crown, a lighter bake on the sides. */
const Bread = () => (
  <svg viewBox="0 0 100 56" aria-hidden="true">
    <Contact cx={50} cy={53} rx={43} />
    <path d="M10 25h80v24c0 2.6-2 4-4.5 4h-71C12 53 10 51.6 10 49Z" fill="url(#r-crust-side)" />
    <path d="M10 46c20 3 60 3 80 0v3c0 2.6-2 4-4.5 4h-71C12 53 10 51.6 10 49Z" fill="#5a3418" opacity=".55" />
    <path d="M7 26C7 13 26 6 50 6s43 7 43 20c0 2-1.6 3.2-3.4 3.2H10.4C8.6 29.2 7 28 7 26Z" fill="url(#r-crust-top)" />
    <path d="M7 26C7 13 26 6 50 6s43 7 43 20c0 2-1.6 3.2-3.4 3.2H10.4C8.6 29.2 7 28 7 26Z" fill="url(#r-crust-hi)" />
    <path d="M24 22q4 -3 8 -8" fill="none" stroke="#f1d29c" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
    <path d="M24 23.4q4 -3 8 -8" fill="none" stroke="#6b3a15" strokeWidth="1" strokeLinecap="round" opacity=".5" />
    <path d="M40 19q4 -3 8 -8" fill="none" stroke="#f1d29c" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
    <path d="M40 20.4q4 -3 8 -8" fill="none" stroke="#6b3a15" strokeWidth="1" strokeLinecap="round" opacity=".5" />
    <path d="M56 19q4 -3 8 -8" fill="none" stroke="#f1d29c" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
    <path d="M56 20.4q4 -3 8 -8" fill="none" stroke="#6b3a15" strokeWidth="1" strokeLinecap="round" opacity=".5" />
    <path d="M72 22q4 -3 8 -8" fill="none" stroke="#f1d29c" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
    <path d="M72 23.4q4 -3 8 -8" fill="none" stroke="#6b3a15" strokeWidth="1" strokeLinecap="round" opacity=".5" />
    <path d="M10.5 29.5h79" stroke="#3d2210" strokeWidth="2" opacity=".35" filter="url(#a-soft)" />
    <circle cx="30" cy="22" r=".7" fill="#f8e6c4" opacity=".7" />
    <circle cx="62" cy="20" r=".6" fill="#f8e6c4" opacity=".6" />
    <circle cx="74" cy="23" r=".5" fill="#f8e6c4" opacity=".6" />
  </svg>
)

/** Clear glass milk bottle with a foil cap. */
const Milk = () => (
  <svg viewBox="0 0 54 100" aria-hidden="true">
    <Contact cx={27} cy={97} rx={20} />
    <path d="M21 16v7c0 7-11 11-11 22v44c0 4.2 3 6.5 7.6 6.5h18.8c4.6 0 7.6-2.3 7.6-6.5V45c0-11-11-15-11-22v-7Z" fill="url(#r-milk)" />
    <path d="M20 10v12c0 8-12 12-12 24v44c0 5 4 7 9 7h20c5 0 9-2 9-7V46c0-12-12-16-12-24V10Z" fill="url(#r-glass)" stroke="#dfe9f0" strokeOpacity=".45" strokeWidth=".8" />
    <rect x="18.5" y="4" width="17" height="7.5" rx="2" fill="url(#r-foil)" />
    <path d="M18.5 9.8h17" stroke="#152742" strokeWidth=".9" opacity=".6" />
    <rect x="12" y="46" width="3.4" height="44" rx="1.7" fill="#fff" opacity=".55" />
    <rect x="39" y="50" width="1.6" height="36" rx=".8" fill="#fff" opacity=".25" />
    <path d="M10.5 60h33" stroke="#c9cdd4" strokeWidth=".7" opacity=".5" />
  </svg>
)

/** Red enamelled steel fuel can with a pressed cross and a steel cap. */
const Fuel = () => (
  <svg viewBox="0 0 80 92" aria-hidden="true">
    <Contact cx={41} cy={89} rx={35} />
    <polygon points="62,18 72,13 72,84 62,89" fill="url(#r-can-side)" />
    <polygon points="10,18 20,13 72,13 62,18" fill="url(#r-can-top)" />
    <rect x="10" y="18" width="52" height="71" rx="3" fill="url(#r-can)" />
    <path d="M17 26l38 54M55 26L17 80" stroke="#3d0b06" strokeWidth="2.6" opacity=".5" />
    <path d="M17 27.6l38 54M55 27.6L17 81.6" stroke="#e4775a" strokeWidth="1.1" opacity=".55" />
    <rect x="14" y="22" width="44" height="63" rx="2" fill="none" stroke="#e06a4c" strokeWidth=".7" opacity=".35" />
    <path d="M16 13V6a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v7" fill="none" stroke="url(#r-can-top)" strokeWidth="5" />
    <rect x="21" y="6" width="7" height="5" rx="1.5" fill="#1c0603" opacity=".85" />
    <rect x="33" y="6" width="7" height="5" rx="1.5" fill="#1c0603" opacity=".85" />
    <rect x="51" y="3.5" width="11" height="8.5" rx="1.6" fill="url(#r-steel)" />
    <rect x="13" y="21" width="2.6" height="64" rx="1.3" fill="#ffd2c2" opacity=".3" />
  </svg>
)

/** Cinema ticket: ivory card, red band, gold foil frame, perforated stub. */
const Ticket = () => (
  <svg viewBox="0 0 100 46" aria-hidden="true">
    <Contact cx={50} cy={43} rx={44} ry={2.2} />
    <path d="M4 5h92v12a6 6 0 0 0 0 12v12H4V29a6 6 0 0 0 0-12Z" fill="url(#r-card)" />
    <rect x="4" y="5" width="70" height="7" fill="url(#r-red)" />
    <rect x="4" y="34" width="70" height="7" fill="url(#r-red)" />
    <text x="39" y="26" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="8.2" fontWeight="500" letterSpacing="2.2" fill="#6e1a17">CINEMA</text>
    <rect x="12" y="15" width="54" height="16" rx="1" fill="none" stroke="url(#g-face)" strokeWidth=".9" />
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx="75" cy={8.5 + i * 4.2} r=".95" fill="#8a7a5c" opacity=".8" />
    ))}
    <text x="86" y="25.5" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="7" fill="#6e1a17" opacity=".85">No.</text>
    <path d="M4 5h92v2.2H4Z" fill="#fff" opacity=".35" />
  </svg>
)

/** A small cast gold bar. */
const Gold = () => (
  <svg viewBox="0 0 60 40" aria-hidden="true">
    <Contact cx={31} cy={35} rx={27} ry={2.4} />
    <polygon points="50,34 58,28 52,12 44,16" fill="url(#g-side)" />
    <polygon points="12,16 44,16 52,12 19,12" fill="url(#g-top)" />
    <polygon points="4,34 50,34 44,16 12,16" fill="url(#g-face)" />
    <polygon points="14,30 40,30 37,20 17,20" fill="none" stroke="#7a5414" strokeWidth=".8" opacity=".5" />
    <path d="M12.4 16.6h31.4" stroke="#fffbe8" strokeWidth=".9" opacity=".9" />
    <path d="M6 33h20" stroke="#fff3c9" strokeWidth=".7" opacity=".5" />
  </svg>
)

export const Note = () => (
  <svg viewBox="0 0 120 60" aria-hidden="true">
    <rect x="2" y="2" width="116" height="56" rx="3" fill="url(#a-note)" />
    <rect x="8" y="8" width="104" height="44" rx="1.5" fill="none" stroke="#9c8250" strokeWidth=".9" opacity=".7" />
    <circle cx="90" cy="30" r="13" fill="none" stroke="#9c8250" strokeWidth=".9" opacity=".6" />
    <path d="M16 20h40M16 26h30M16 40h22" stroke="#9c8250" strokeWidth="1.2" opacity=".5" strokeLinecap="round" />
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

/** Stone plinth with a lit bevel. */
export function Pedestal({ ghost }) {
  return (
    <svg className="pedestal" viewBox="0 0 560 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <ellipse cx="280" cy="364" rx="272" ry="32" fill="url(#a-floor)" />
      <path d="M86 198v150a194 28 0 0 0 388 0V198Z" fill="url(#a-ped-body)" />
      <path d="M86 198v150a194 28 0 0 0 388 0V198Z" fill="#000" filter="url(#a-stone)" opacity=".45" />
      <path d="M86 198v150a194 28 0 0 0 388 0V198Z" fill="url(#a-ped-shade)" />
      <path d="M86 336a194 28 0 0 0 388 0" fill="none" stroke="#000" strokeWidth="1" opacity=".5" />
      {/* bevel band */}
      <path d="M80 190v6a200 32 0 0 0 400 0v-6a200 34 0 0 1-400 0Z" fill="url(#a-bevel)" />
      <ellipse cx="280" cy="190" rx="200" ry="34" fill="url(#a-ped-top)" />
      <ellipse cx="280" cy="190" rx="200" ry="34" fill="#000" filter="url(#a-stone)" opacity=".5" />
      <path d="M80 190a200 34 0 0 0 400 0" fill="none" stroke={ghost ? '#9db1d1' : '#e6d6ad'} strokeWidth="1" opacity=".5" />
      <ellipse cx="268" cy="183" rx="130" ry="15" fill="#fff4dc" opacity={ghost ? 0.03 : 0.08} filter="url(#a-soft)" />
    </svg>
  )
}
