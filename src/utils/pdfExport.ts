import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { PageSize, Orientation } from '../types'

// Physical page sizes in mm (trim size, no bleed)
const PAGE_SIZES_MM: Record<PageSize, { w: number; h: number }> = {
  a4:     { w: 210,   h: 297   },
  a5:     { w: 148,   h: 210   },
  a3:     { w: 297,   h: 420   },
  letter: { w: 215.9, h: 279.4 },
  square: { w: 210,   h: 210   },
}

const PRINT_DPI   = 300
const MM_PER_INCH = 25.4
const BLEED_MM    = 3
const MARK_GAP_MM = 2   // space between trim edge and crop mark
const MARK_LEN_MM = 6   // length of crop mark line

// ── OKLCH → sRGB ───────────────────────────────────────────────────────────

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

function patchInlineStyles(root: HTMLElement) {
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of all) {
    const css = el.style.cssText
    if (!css.includes('oklch') && !css.includes('color-mix')) continue
    let next = replaceOklch(css)
    el.style.cssText = next
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

function patchStyleSheets(doc: Document) {
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i]
      if (!rule.cssText.includes('oklch') && !rule.cssText.includes('color-mix')) continue
      try {
        sheet.deleteRule(i)
        sheet.insertRule(replaceOklch(rule.cssText), i)
      } catch { /* skip unparseable rules */ }
    }
  }
}

// ── Capture ─────────────────────────────────────────────────────────────────

async function captureElement(el: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  const prevZoom = el.style.zoom
  el.style.zoom = '1'
  const canvas = await html2canvas(el, {
    scale,
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

// ── Crop marks (mm coords) ───────────────────────────────────────────────────

function addCropMarksMm(pdf: jsPDF, trimW: number, trimH: number, bMm: number) {
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.25)

  // Trim-box corners in the PDF coordinate space
  const corners = [
    { x: bMm,         y: bMm         },
    { x: bMm + trimW, y: bMm         },
    { x: bMm + trimW, y: bMm + trimH },
    { x: bMm,         y: bMm + trimH },
  ]

  for (const { x, y } of corners) {
    const sx = x === bMm ? -1 : 1
    const sy = y === bMm ? -1 : 1
    // horizontal mark
    pdf.line(x + sx * MARK_GAP_MM, y, x + sx * (MARK_GAP_MM + MARK_LEN_MM), y)
    // vertical mark
    pdf.line(x, y + sy * MARK_GAP_MM, x, y + sy * (MARK_GAP_MM + MARK_LEN_MM))
  }
}

// ── Main export ──────────────────────────────────────────────────────────────

export async function exportPDF(
  bleed: boolean,
  pageSize: PageSize,
  orientation: Orientation,
  onProgress?: (pct: number) => void,
): Promise<void> {
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

  // Physical trim size in mm
  const sizes = PAGE_SIZES_MM[pageSize] ?? PAGE_SIZES_MM.a4
  const trimW = orientation === 'landscape' ? sizes.h : sizes.w
  const trimH = orientation === 'landscape' ? sizes.w : sizes.h

  // PDF page includes bleed on all sides when enabled
  const bMm   = bleed ? BLEED_MM : 0
  const pdfW  = trimW + bMm * 2
  const pdfH  = trimH + bMm * 2

  // Capture scale → target 300 DPI
  // Element is rendered at screen px; we need targetPx wide at 300 DPI
  const elW        = allEls[0].getBoundingClientRect().width
  const targetPxW  = trimW * (PRINT_DPI / MM_PER_INCH)   // e.g. A4 portrait → 2480 px
  const scale      = Math.max(3, Math.min(8, Math.ceil(targetPxW / elW)))

  const pdf = new jsPDF({
    orientation: trimW > trimH ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pdfW, pdfH],
  })

  // Embed print metadata
  pdf.setProperties({
    title: 'Spread Studio Catalog',
    creator: 'Spread Studio',
    keywords: 'catalog, print-ready',
  })

  for (let i = 0; i < allEls.length; i++) {
    onProgress?.(Math.round((i / allEls.length) * 90))
    const canvas  = await captureElement(allEls[i], scale)
    // PNG for lossless quality
    const imgData = canvas.toDataURL('image/png')
    if (i > 0) pdf.addPage([pdfW, pdfH])
    // Place image at bleed offset; fills trim area exactly
    pdf.addImage(imgData, 'PNG', bMm, bMm, trimW, trimH, undefined, 'FAST')
    if (bleed) addCropMarksMm(pdf, trimW, trimH, bMm)
  }

  onProgress?.(100)
  pdf.save('spread-studio-catalog.pdf')
}
