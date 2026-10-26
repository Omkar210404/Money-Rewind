// Draws a 1200 x 630 share card on a canvas and returns a PNG blob.
// Item icons are the same SVGs (or the visitor's PNGs) shown on the page.

const W = 1200
const H = 630

function svgToImage(svg) {
  const defs = document.querySelector('#art-defs defs')
  const clone = svg.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('width', '120')
  clone.setAttribute('height', '120')
  if (defs) clone.insertBefore(defs.cloneNode(true), clone.firstChild)
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: 'image/svg+xml' }))
  return loadImage(url).finally(() => setTimeout(() => URL.revokeObjectURL(url), 1000))
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function fit(img, maxW, maxH) {
  const ratio = (img.naturalWidth || img.width) / (img.naturalHeight || img.height) || 1
  let w = maxW
  let h = w / ratio
  if (h > maxH) {
    h = maxH
    w = h * ratio
  }
  return [w, h]
}

/**
 * card: { kicker, big, sentence, rows: [{ el, strong, text, note }], footnote }
 * el is the <svg> or <img> on the page used as the row's icon.
 */
export async function drawShareCard(card) {
  await Promise.all([
    document.fonts.load('300 140px "Fraunces Variable"'),
    document.fonts.load('italic 300 40px "Fraunces Variable"'),
    document.fonts.load('500 22px "Inter Variable"'),
  ]).catch(() => {})

  const cv = document.createElement('canvas')
  cv.width = W * 2
  cv.height = H * 2
  const g = cv.getContext('2d')
  g.scale(2, 2)

  // charcoal to ink blue, a spotlight, cool shadow
  const bg = g.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#17181c')
  bg.addColorStop(0.5, '#10131a')
  bg.addColorStop(1, '#0a1120')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  const spot = g.createRadialGradient(860, -40, 10, 860, 120, 520)
  spot.addColorStop(0, 'rgba(255,236,200,0.16)')
  spot.addColorStop(1, 'rgba(255,236,200,0)')
  g.fillStyle = spot
  g.fillRect(0, 0, W, H)
  const cool = g.createRadialGradient(1100, 640, 10, 1100, 640, 520)
  cool.addColorStop(0, 'rgba(40,70,130,0.35)')
  cool.addColorStop(1, 'rgba(40,70,130,0)')
  g.fillStyle = cool
  g.fillRect(0, 0, W, H)
  // film grain
  for (let i = 0; i < 9000; i++) {
    g.fillStyle = `rgba(255,255,255,${Math.random() * 0.035})`
    g.fillRect(Math.random() * W, Math.random() * H, 1, 1)
  }

  // gold hairline frame
  g.strokeStyle = 'rgba(217,165,74,0.35)'
  g.lineWidth = 1
  g.strokeRect(28.5, 28.5, W - 57, H - 57)

  g.fillStyle = '#d9a54a'
  g.font = '500 15px "Inter Variable", Inter, sans-serif'
  g.letterSpacing = '4px'
  g.fillText(card.kicker.toUpperCase(), 64, 82)
  g.letterSpacing = '0px'

  g.fillStyle = '#f1e7d0'
  g.font = '300 132px "Fraunces Variable", Georgia, serif'
  g.fillText(card.big, 58, 220)

  g.fillStyle = '#b9b3a5'
  g.font = 'italic 300 32px "Fraunces Variable", Georgia, serif'
  wrap(g, card.sentence, 64, 276, 560, 40)

  // rows on the right
  let y = 120
  for (const row of card.rows.slice(0, 5)) {
    try {
      const img = row.el?.tagName === 'IMG' ? await loadImage(row.el.src) : row.el ? await svgToImage(row.el) : null
      if (img) {
        const [w, h] = fit(img, 72, 52)
        g.drawImage(img, 680 + (72 - w) / 2, y - 38 + (52 - h) / 2, w, h)
      }
    } catch {
      /* icon is decoration only */
    }
    g.fillStyle = '#f3d18b'
    g.font = '400 34px "Fraunces Variable", Georgia, serif'
    g.fillText(row.strong, 770, y)
    const sw = g.measureText(row.strong).width
    g.fillStyle = '#f1e7d0'
    g.font = '400 18px "Inter Variable", Inter, sans-serif'
    g.fillText(row.text, 770 + sw + 10, y)
    if (row.note) {
      g.fillStyle = '#7f8592'
      g.font = '400 15px "Inter Variable", Inter, sans-serif'
      g.fillText(row.note, 770, y + 22)
    }
    y += 88
  }

  g.fillStyle = '#7f8592'
  g.font = '400 14px "Inter Variable", Inter, sans-serif'
  wrap(g, card.footnote, 64, H - 128, 560, 20)
  g.fillStyle = '#f1e7d0'
  g.font = '400 18px "Fraunces Variable", Georgia, serif'
  g.fillText('Time Machine for Money', 64, H - 48)

  return new Promise((resolve) => cv.toBlob(resolve, 'image/png'))
}

function wrap(g, text, x, y, maxW, lh) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, y)
      line = w
      y += lh
    } else line = test
  }
  if (line) g.fillText(line, x, y)
}

export function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
