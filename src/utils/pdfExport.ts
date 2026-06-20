import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import type { PageSize, Orientation } from '../types'

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
const MARK_GAP_MM = 2
const MARK_LEN_MM = 6

// ── OKLCH → sRGB ─────────────────────────────────────────────────────────────

function oklchToRgb(L: number, C: number, H: number): [number, number, number] {
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad), b = C * Math.sin(hRad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b
  const lc = l_ ** 3, mc = m_ ** 3, sc = s_ ** 3
  const rl =  4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc
  const gl = -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc
  const bl = -0.0041960863 * lc - 0.7034186147 * mc + 1.7076147010 * sc
  const gamma = (x: number) => x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055
  return [
    Math.round(Math.max(0, Math.min(255, gamma(rl) * 255))),
    Math.round(Math.max(0, Math.min(255, gamma(gl) * 255))),
    Math.round(Math.max(0, Math.min(255, gamma(bl) * 255))),
  ]
}

function replaceOklch(css: string): string {
  return css.replace(
    /oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)/g,
    (_, L, C, H, A) => {
      const [r, g, b] = oklchToRgb(Number(L), Number(C), Number(H))
      return A !== undefined ? `rgba(${r},${g},${b},${A})` : `rgb(${r},${g},${b})`
    }
  )
}

function resolveColorMix(el: HTMLElement, prop: string): string {
  return window.getComputedStyle(el).getPropertyValue(prop)
}

// ── Patch/restore document stylesheets (must run BEFORE html2canvas) ──────────

type SheetPatch = { sheet: CSSStyleSheet; index: number; original: string }

function patchDocStyleSheets(): SheetPatch[] {
  const patches: SheetPatch[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try { rules = sheet.cssRules } catch { continue }
    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i]
      if (!rule.cssText.includes('oklch') && !rule.cssText.includes('color-mix')) continue
      const original = rule.cssText
      try {
        sheet.deleteRule(i)
        sheet.insertRule(replaceOklch(original), i)
        patches.push({ sheet, index: i, original })
      } catch { /* skip */ }
    }
  }
  return patches
}

function restoreDocStyleSheets(patches: SheetPatch[]) {
  // Restore in reverse so indices stay stable
  for (const { sheet, index, original } of patches.reverse()) {
    try {
      sheet.deleteRule(index)
      sheet.insertRule(original, index)
    } catch { /* skip */ }
  }
}

// ── Patch/restore inline styles on all elements in the subtree ────────────────

type InlinePatch = { el: HTMLElement; original: string }

function patchInlineStyles(root: HTMLElement): InlinePatch[] {
  const patches: InlinePatch[] = []
  const all = [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]
  for (const el of all) {
    const css = el.style.cssText
    if (!css.includes('oklch') && !css.includes('color-mix')) continue
    patches.push({ el, original: css })
    let next = replaceOklch(css)
    el.style.cssText = next
    // Resolve any leftover color-mix() via the browser's computed value
    if (next.includes('color-mix')) {
      for (let i = 0; i < el.style.length; i++) {
        const prop = el.style.item(i)
        if (el.style.getPropertyValue(prop).includes('color-mix'))
          el.style.setProperty(prop, resolveColorMix(el, prop))
      }
    }
  }
  return patches
}

function restoreInlineStyles(patches: InlinePatch[]) {
  for (const { el, original } of patches) el.style.cssText = original
}

// ── Capture a single page element at print resolution ────────────────────────

async function captureElement(el: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  const prevZoom = el.style.zoom
  el.style.zoom = '1'

  // IMPORTANT: patch the ORIGINAL document before html2canvas parses it.
  // onclone fires after parsing — too late for stylesheet rule errors.
  const sheetPatches  = patchDocStyleSheets()
  const inlinePatches = patchInlineStyles(el)

  const canvas = await html2canvas(el, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: '#ffffff',
  })

  restoreInlineStyles(inlinePatches)
  restoreDocStyleSheets(sheetPatches)
  el.style.zoom = prevZoom
  return canvas
}

// ── Crop marks in mm ──────────────────────────────────────────────────────────

function addCropMarksMm(pdf: jsPDF, trimW: number, trimH: number, bMm: number) {
  pdf.setDrawColor(0, 0, 0)
  pdf.setLineWidth(0.25)
  const corners = [
    { x: bMm,         y: bMm          },
    { x: bMm + trimW, y: bMm          },
    { x: bMm + trimW, y: bMm + trimH  },
    { x: bMm,         y: bMm + trimH  },
  ]
  for (const { x, y } of corners) {
    const sx = x === bMm ? -1 : 1
    const sy = y === bMm ? -1 : 1
    pdf.line(x + sx * MARK_GAP_MM, y, x + sx * (MARK_GAP_MM + MARK_LEN_MM), y)
    pdf.line(x, y + sy * MARK_GAP_MM, x, y + sy * (MARK_GAP_MM + MARK_LEN_MM))
  }
}

// ── Main export ───────────────────────────────────────────────────────────────

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
  const trimW  = orientation === 'landscape' ? sizes.h : sizes.w
  const trimH  = orientation === 'landscape' ? sizes.w : sizes.h
  const bMm    = bleed ? BLEED_MM : 0
  const pdfW   = trimW + bMm * 2
  const pdfH   = trimH + bMm * 2

  // Scale to hit 300 DPI at the physical trim width
  const elW       = allEls[0].getBoundingClientRect().width
  const targetPxW = trimW * (PRINT_DPI / MM_PER_INCH)
  const scale     = Math.max(3, Math.min(8, Math.ceil(targetPxW / elW)))

  const pdf = new jsPDF({
    orientation: trimW > trimH ? 'landscape' : 'portrait',
    unit: 'mm',
    format: [pdfW, pdfH],
  })

  pdf.setProperties({ title: 'Spread Studio Catalog', creator: 'Spread Studio' })

  for (let i = 0; i < allEls.length; i++) {
    onProgress?.(Math.round((i / allEls.length) * 90))
    const canvas  = await captureElement(allEls[i], scale)
    const imgData = canvas.toDataURL('image/png')
    if (i > 0) pdf.addPage([pdfW, pdfH])
    pdf.addImage(imgData, 'PNG', bMm, bMm, trimW, trimH, undefined, 'FAST')
    if (bleed) addCropMarksMm(pdf, trimW, trimH, bMm)
  }

  onProgress?.(100)
  pdf.save('spread-studio-catalog.pdf')
}
