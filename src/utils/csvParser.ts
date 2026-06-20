import type { Product, Tag } from '../types'

function parseRow(row: string): string[] {
  const cells: string[] = []
  let cur = '', inQuote = false
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      if (inQuote && row[i + 1] === '"') { cur += '"'; i++ }
      else inQuote = !inQuote
    } else if (ch === ',' && !inQuote) {
      cells.push(cur.trim()); cur = ''
    } else {
      cur += ch
    }
  }
  cells.push(cur.trim())
  return cells
}

export function parseCSV(text: string): Product[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(l => l.trim())
  if (lines.length < 2) return []

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))

  const idx = (names: string[]) => {
    for (const n of names) { const i = headers.indexOf(n); if (i >= 0) return i }
    return -1
  }

  const nameIdx = idx(['name', 'product_name', 'title', 'item'])
  const catIdx = idx(['category', 'cat', 'type', 'department'])
  const wasIdx = idx(['was', 'original_price', 'old_price', 'mrp', 'rrp', 'regular_price'])
  const nowIdx = idx(['now', 'price', 'sale_price', 'selling_price', 'current_price'])
  const descIdx = idx(['desc', 'description', 'details', 'subtitle'])
  const tagTIdx = idx(['tag_text', 'tag', 'badge', 'label'])
  const tagCIdx = idx(['tag_color', 'tag_colour', 'badge_color'])
  const imgIdx = idx(['image_url', 'image', 'img', 'photo', 'image_link', 'img_url'])

  const products: Product[] = []

  for (let i = 1; i < lines.length; i++) {
    const cells = parseRow(lines[i])
    const get = (idx: number) => (idx >= 0 ? (cells[idx] ?? '') : '').trim()

    const name = get(nameIdx)
    if (!name) continue

    const wasRaw = parseFloat(get(wasIdx).replace(/[^0-9.]/g, '')) || 0
    const nowRaw = parseFloat(get(nowIdx).replace(/[^0-9.]/g, '')) || 0

    const tagText = get(tagTIdx)
    const tagCol = get(tagCIdx).toLowerCase() as 'green' | 'violet' | 'blue'
    const tag: Tag | null = tagText
      ? { t: tagText, col: ['green', 'violet', 'blue'].includes(tagCol) ? tagCol : 'green' }
      : null

    products.push({
      id: `csv-${i}-${Math.random().toString(36).slice(2, 7)}`,
      name,
      desc: get(descIdx),
      category: get(catIdx),
      was: wasRaw,
      now: nowRaw || wasRaw,
      imageUrl: get(imgIdx) || undefined,
      tag,
      align: 'left',
      text: '',
      showDesc: true,
      showBadge: true,
      showImage: true,
      showTitle: true,
      showPrice: true,
      showDiscount: true,
      showText: false,
      blank: false,
      ov: {},
    })
  }

  return products
}
