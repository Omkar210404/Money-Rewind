// Thin line icons (1.5px strokes, 20px grid) used instead of emoji.

const Base = ({ children, size = 16, ...rest }) => (
  <svg viewBox="0 0 20 20" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
    {children}
  </svg>
)

export const Pencil = (p) => <Base {...p}><path d="M13.5 3.5l3 3L7 16H4v-3z" /><path d="M11.5 5.5l3 3" /></Base>
export const Arrow = (p) => <Base {...p}><path d="M4 10h12M11 5l5 5-5 5" /></Base>
export const Swap = (p) => <Base {...p}><path d="M4 7h11l-3-3M16 13H5l3 3" /></Base>
export const Close = (p) => <Base {...p}><path d="M5 5l10 10M15 5L5 15" /></Base>
export const Download = (p) => <Base {...p}><path d="M10 3v10M6 9l4 4 4-4M4 16h12" /></Base>
export const Share = (p) => <Base {...p}><path d="M10 13V3M6 7l4-4 4 4M4 11v5h12v-5" /></Base>
export const Cake = (p) => <Base {...p}><path d="M4 16h12v-5H4zM4 13c2 1 4-1 6 0s4 1 6 0M10 11V8M10 5.5c.8-.6.8-1.4 0-2.2-.8.8-.8 1.6 0 2.2z" /></Base>
export const Drag = (p) => <Base {...p}><path d="M7 6L3 10l4 4M13 6l4 4-4 4" /></Base>
