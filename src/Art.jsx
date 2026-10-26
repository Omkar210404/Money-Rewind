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

/** Sliced tin loaf, side view: straight sides, a gently rounded crown, slice lines. */
const Bread = () => (
  <svg viewBox="0 0 100 56" aria-hidden="true">
    <Contact cx={50} cy={53} rx={43} />
    <path d="M9 24h82v25c0 2.5-2 4-4.5 4h-73C11 53 9 51.5 9 49Z" fill="url(#p-round)" />
    <path d="M7 25c0-11 19-18 43-18s43 7 43 18c0 2-1.6 3-3.4 3H10.4C8.6 28 7 27 7 25Z" fill="url(#p-dome)" />
    <path d="M9.5 28.5h81" stroke="#4d5462" strokeWidth="2.4" opacity=".28" filter="url(#a-soft)" />
    {[22, 33, 44, 55, 66, 77].map((x) => (
      <g key={x}>
        <path d={`M${x} ${x < 30 || x > 70 ? 13 : 9.5}v42`} stroke="#8e8b84" strokeWidth=".9" opacity=".45" />
        <path d={`M${x + 0.9} ${x < 30 || x > 70 ? 13 : 9.5}v42`} stroke="#fffaf0" strokeWidth=".6" opacity=".5" />
      </g>
    ))}
    <ellipse cx="34" cy="13" rx="15" ry="2.6" fill="url(#p-spec)" opacity=".7" />
  </svg>
)

/** Glass-shaped dairy bottle in porcelain with a gilt cap. */
const Milk = () => (
  <svg viewBox="0 0 54 100" aria-hidden="true">
    <Contact cx={27} cy={97} rx={20} />
    <path d="M20 10v12c0 8-12 12-12 24v44c0 5 4 7 9 7h20c5 0 9-2 9-7V46c0-12-12-16-12-24V10Z" fill="url(#p-round)" />
    <path d="M8 64h38M8 67h38" stroke="#6b6e76" strokeWidth=".8" opacity=".35" />
    <rect x="18" y="3" width="18" height="8" rx="2" fill="url(#g-round)" />
    <rect x="18" y="9.2" width="18" height="1.6" fill="#5e400e" opacity=".55" />
    <rect x="12.5" y="44" width="4" height="46" rx="2" fill="url(#p-spec)" opacity=".8" />
    <ellipse cx="17" cy="38" rx="5" ry="3" fill="url(#p-spec)" opacity=".6" />
  </svg>
)

/** Jerrycan with an embossed cross, gilt spout cap. */
const Fuel = () => (
  <svg viewBox="0 0 80 92" aria-hidden="true">
    <Contact cx={41} cy={89} rx={35} />
    <polygon points="62,18 72,13 72,84 62,89" fill="url(#p-side)" />
    <polygon points="10,18 20,13 72,13 62,18" fill="url(#p-top)" />
    <rect x="10" y="18" width="52" height="71" rx="3" fill="url(#p-face)" />
    {/* embossed X: a shadow line and a highlight line */}
    <path d="M17 26l38 54M55 26L17 80" stroke="#7c7c80" strokeWidth="2.4" opacity=".4" />
    <path d="M17 27.6l38 54M55 27.6L17 81.6" stroke="#fffaf0" strokeWidth="1.2" opacity=".55" />
    <rect x="14" y="22" width="44" height="63" rx="2" fill="none" stroke="#9c978d" strokeWidth=".9" opacity=".5" />
    <path d="M16 13V6a3 3 0 0 1 3-3h24a3 3 0 0 1 3 3v7" fill="none" stroke="url(#p-face)" strokeWidth="5" />
    <rect x="21" y="6" width="7" height="5" rx="1.5" fill="#4f5665" opacity=".55" />
    <rect x="33" y="6" width="7" height="5" rx="1.5" fill="#4f5665" opacity=".55" />
    <rect x="52" y="4" width="10" height="8" rx="1.6" fill="url(#g-round)" />
    <rect x="12" y="21" width="3" height="64" rx="1.5" fill="url(#p-spec)" opacity=".8" />
  </svg>
)

/** Ticket stub: notched card, gilt edging, perforation. No lettering. */
const Ticket = () => (
  <svg viewBox="0 0 100 46" aria-hidden="true">
    <Contact cx={50} cy={43} rx={44} ry={2.2} />
    <path d="M4 5h92v12a6 6 0 0 0 0 12v12H4V29a6 6 0 0 0 0-12Z" fill="url(#p-face)" />
    <path d="M4 5h92v3H4Z" fill="#fffaf0" opacity=".6" />
    <rect x="11" y="11" width="56" height="24" rx="1.5" fill="none" stroke="url(#g-face)" strokeWidth="1.1" />
    <path d="M39 18l5 5-5 5-5-5Z" fill="none" stroke="url(#g-face)" strokeWidth="1" />
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={i} cx="75" cy={8.5 + i * 4.2} r=".95" fill="#6f7179" opacity=".7" />
    ))}
    <rect x="80" y="17" width="9" height="12" rx="1" fill="none" stroke="url(#g-face)" strokeWidth=".9" opacity=".8" />
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
