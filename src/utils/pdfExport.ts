import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

// OKLCH → linear-sRGB → gamma-sRGB
function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad), b = C * Math.sin(hRad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  const rl =  4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const gl = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  const gamma = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  return [
    Math.round(Math.max(0, Math.min(255, gamma(rl) * 255))),
    Math.round(Math.max(0, Math.min(255, gamma(gl) * 255))),
    Math.round(Math.max(0, Math.min(255, gamma(bl) * 255))),
  ]
}

function replaceOklch(css: string): string {
  return css.replace(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/g, (_, L, C, H, A) => {
    const [r, g, b] = oklchToRgb(Number(L), Number(C), Number(H))
    return A !== undefined ? `rgba(${r},${g},${b},${A})` : `rgb(${r},${g},${b})`
  })
}

// Patch all inline styles in a cloned subtree (no need to restore — it's a clone)
function patchInlineStyles(root: HTMLElement) {
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of all) {
    const css = el.style.cssText
    if (!css.includes('oklch') && !css.includes('color-mix')) continue
    let next = replaceOklch(css)
    el.style.cssText = next
    // Resolve any leftover color-mix() using the cloned element's computed style
    if (next.includes('color-mix')) {
      const cs = window.getComputedStyle(el)
      for (let i = 0; i < el.style.length; i++) {
        const prop = el.style.item(i)
        if (el.style.getPropertyValue(prop).includes('color-mix'))
          el.style.setProperty(prop, cs.getPropertyValue(prop))
      }
    }
  }
}

// Patch all CSSRule text in a cloned document's stylesheets
function patchStyleSheets(doc: Document) {
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue } // skip cross-origin
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i]
      if (!rule.cssText.includes('oklch') && !rule.cssText.includes('color-mix')) continue
      try {
        sheet.deleteRule(i)
        sheet.insertRule(replaceOklch(rule.cssText), i)
      } catch { /* ignore unparseable rules */ }
    }
  }
}

async function captureElement(el: HTMLElement): Promise<HTMLCanvasElement> {
  const prevZoom = el.style.zoom
  el.style.zoom = '1'
  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
    onclone: (clonedDoc: Document, clonedEl: HTMLElement) => {
      patchStyleSheets(clonedDoc)
      patchInlineStyles(clonedEl)
    },
  })
  el.style.zoom = prevZoom
  return canvas
}

function addCropMarks(pdf: jsPDF, w: number, h: number, _bleedMm: number) {
  const tick = 20
  const gap = 5
  pdf.setDrawColor(0)
  pdf.setLineWidth(0.25)
  const corners = [
    { x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h },
  ]
  for (const { x, y } of corners) {
    const sx = x === 0 ? -1 : 1
    const sy = y === 0 ? -1 : 1
    pdf.line(x + sx * gap, y, x + sx * (gap + tick), y)
    pdf.line(x, y + sy * gap, x, y + sy * (gap + tick))
  }
}

export async function exportPDF(bleed: boolean, onProgress?: (pct: number) => void): Promise<void> {
  const coverEl = document.getElementById('sp-cover')
  if (!coverEl) throw new Error('No catalog pages found – open the editor first.')

  const allEls: HTMLElement[] = [coverEl]
  let pi = 0
  while (document.getElementById(`sp-pg-${pi}`)) {
    allEls.push(document.getElementById(`sp-pg-${pi}`)!)
    pi++
  }
  const mpEls = Array.from(document.querySelectorAll('[id^="sp-mp-"]')) as HTMLElement[]
  allEls.push(...mpEls)

  const first = allEls[0]
  const pxW = first.getBoundingClientRect().width
  const pxH = first.getBoundingClientRect().height

  const pdf = new jsPDF({
    orientation: pxW > pxH ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pxW, pxH],
    hotfixes: ['px_scaling'],
  })

  for (let i = 0; i < allEls.length; i++) {
    onProgress?.(Math.round((i / allEls.length) * 90))
    const canvas = await captureElement(allEls[i])
    const imgData = canvas.toDataURL('image/jpeg', 0.92)
    if (i > 0) pdf.addPage([pxW, pxH])
    pdf.addImage(imgData, 'JPEG', 0, 0, pxW, pxH)
    if (bleed) addCropMarks(pdf, pxW, pxH, 3)
  }

  onProgress?.(100)
  pdf.save('spread-studio-catalog.pdf')
}
