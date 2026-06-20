import { ACCENTS, GRIDS, SIZES, TAGCOL } from '../../constants'
import type { Product, Template, GridKey, PageSize, Orientation } from '../../types'

export interface AccentDef {
  name: string
  color: string
  soft: string
  border: string
}

export function computeAccent(accentKey: string, customAccent: string): AccentDef {
  if (accentKey === 'custom') {
    return {
      name: 'Custom',
      color: customAccent,
      soft: `color-mix(in oklab, ${customAccent} 12%, #fff)`,
      border: `color-mix(in oklab, ${customAccent} 38%, #fff)`,
    }
  }
  return ACCENTS[accentKey] ?? ACCENTS.red
}

export function computePageDimensions(pageSize: PageSize, orientation: Orientation) {
  const sz = SIZES[pageSize] ?? SIZES.a4
  let w: number, h: number
  if (orientation === 'landscape') {
    w = sz.long; h = Math.round(sz.long / sz.ratio)
  } else {
    h = sz.long; w = Math.round(sz.long / sz.ratio)
  }
  const cap = 660
  const scale = w > cap ? cap / w : 1
  return { pageW: Math.round(w * scale), pageH: Math.round(h * scale), sizeLabel: sz.label }
}

export interface GridTokens {
  gKey: GridKey
  cols: number
  rows: number
  perPage: number
  small: boolean
  mid: boolean
  cellGap: number
  cellRadBase: number
  cellRowH: number
  gridCols: string
  saveDim: number
  saveLblF: number
  savePctF: number
  nameF: number
  priceIntF: number
  priceCentF: number
}

export function gridTokens(gKey: GridKey, pageH: number, tpl: Template): GridTokens {
  const g = GRIDS[gKey] ?? GRIDS['3x3']
  const cols = g.cols, rows = g.rows
  const small = cols >= 4, mid = cols === 3
  const cellGap = small ? 8 : 11
  const cellRadBase = tpl === 'clean' ? 6 : (small ? 9 : 13)
  return {
    gKey, cols, rows, perPage: cols * rows, small, mid, cellGap, cellRadBase,
    cellRowH: Math.max(96, Math.floor((pageH - 104 - (rows - 1) * cellGap) / rows)),
    gridCols: `repeat(${cols}, 1fr)`,
    saveDim: small ? 32 : (mid ? 42 : 50),
    saveLblF: small ? 6.5 : 8.5, savePctF: small ? 11 : 15,
    nameF: small ? 11 : (mid ? 12.5 : 14.5),
    priceIntF: small ? 17 : (mid ? 21 : 26),
    priceCentF: small ? 9.5 : (mid ? 11 : 13),
  }
}

export interface EnrichedProduct extends Product {
  index: number
  num: string
  wasText: string
  nowText: string
  nowInt: string
  nowCents: string
  savePct: number
  payIn4: string
  imgBg: string
  cellBg: string
  cellText: string
  border: string
  pillBg: string
  pillText: string
  usePill: boolean
  plainPrice: boolean
  descCol: string
  strikeCol: string
  showTopStripe: boolean
  cellDir: 'row' | 'column'
  imgFlex: string
  imgMinH: string
  infoFlex: string
  infoPad: string
  cellRadius: number
  cellOpacity: number
  nameWeight: number
  nameTransform: string
  colSpan: string
  justify: string
  imgLabel: string
  nameDisplay: string
  nameColor: string
  isEditingName: boolean
  notEditingName: boolean
  isEditingDesc: boolean
  notEditingDesc: boolean
  descDisplay: string
  descColShown: string
  showDesc: boolean
  showText: boolean
  textDisplay: string
  pricePlaceholder: boolean
  showDiscountRow: boolean
  showBadge: boolean
  showChips: boolean
  hasTag: boolean
  tagText: string
  tagBg: string
  ringStyle: string
  imageUrl: string | undefined
  cellDraggable: boolean
  dragOpacity: string
  nameF: number
  saveDim: number
  saveLblF: number
  savePctF: number
  priceIntF: number
  priceCentF: number
}

export function stripeBg() {
  return 'repeating-linear-gradient(135deg,#F3F1EC,#F3F1EC 11px,#EDEAE3 11px,#EDEAE3 22px)'
}

export function money(n: number) {
  return '$' + Number(n).toFixed(2)
}

export function ring(active: boolean, color: string) {
  return active ? `0 0 0 2px ${color}` : '0 0 0 1px #EAE6DD'
}

export function swX(on: boolean) {
  return on ? '18px' : '2px'
}

export function enrichItem(
  p: Product,
  index: number,
  tk: GridTokens,
  tpl: Template,
  ac: AccentDef,
  _badge: string,
  selectedId: string | null,
  dragId: string | null,
  editingId: { id: string; field: string } | null,
): EnrichedProduct {
  const { small, cellGap: _cg, cellRadBase, nameF, saveDim, saveLblF, savePctF, priceIntF, priceCentF } = tk
  const ov = p.ov ?? {}
  const accent = ac.color

  const hasName = (p.name ?? '').trim().length > 0
  const hasDesc = (p.desc ?? '').trim().length > 0
  const hasNow = Number(p.now) > 0
  const hasWas = Number(p.was) > 0
  const savePct = hasWas && hasNow ? Math.round(((p.was - p.now) / p.was) * 100) : 0
  const nowParts = Number(p.now).toFixed(2).split('.')
  const nowInt = nowParts[0], nowCents = nowParts[1] ?? '00'

  let cellBg = '#fff', border = '1px solid #ECE8DF', cellText = '#211D17'
  let pillBg = accent, pillText = '#fff'
  let usePill = true, descCol = '#9A9182', imgBg = stripeBg()
  let strikeCol = '#B7AE9E', showTopStripe = false

  if (tpl === 'mega') { showTopStripe = true }
  else if (tpl === 'clean') { border = '1px solid #F0ECE3'; usePill = false }
  else if (tpl === 'bomb') { cellBg = ac.soft; border = '1px solid ' + ac.border }
  else if (tpl === 'spec') { border = '2px solid ' + ac.border }

  if (ov.bg === 'white') cellBg = '#fff'
  else if (ov.bg === 'cream') cellBg = '#FBF6EC'
  else if (ov.bg === 'tint') cellBg = ac.soft
  else if (ov.bg === 'custom') cellBg = ov.customBg ?? '#fff'

  const invert = ov.bg === 'accent'
  if (invert) {
    cellBg = accent; cellText = '#fff'; border = '1px solid ' + accent
    pillBg = '#fff'; pillText = accent
    descCol = 'rgba(255,255,255,.78)'; imgBg = 'rgba(255,255,255,.14)'
    strikeCol = 'rgba(255,255,255,.7)'; usePill = true; showTopStripe = false
  }

  if (ov.borderOn) border = `${ov.borderW ?? 2}px solid ${ov.borderColor ?? accent}`

  const row = ov.imgPos === 'left'
  const padMap: Record<number, string> = { 0: '4px 8px', 1: '9px 11px', 2: '15px 16px', 4: '24px 26px' }
  const padv = ov.pad ?? 1
  const radius = ov.radius ?? cellRadBase
  const opacity = ov.opacity ?? 1
  const nameWeight = ov.nameWeight ?? 700
  const curAlign = ov.align ?? p.align ?? 'left'

  const isSel = selectedId === p.id
  let bs = isSel ? `0 0 0 2px ${accent}` : '0 0 0 1px #ECE8DF'
  if (ov.shadow) bs += ', 0 8px 22px rgba(33,29,23,.16)'

  const fImage = p.showImage !== false
  const fTitle = p.showTitle !== false
  const fPrice = p.showPrice !== false
  const fDiscount = p.showDiscount !== false
  const fText = !!p.showText
  const editing = editingId?.id === p.id
  const editingName = !!editing && editingId?.field === 'name'
  const editingDesc = !!editing && editingId?.field === 'desc'
  const placeholderCol = invert ? 'rgba(255,255,255,.55)' : '#C2BBA8'
  const showDescField = (p.showDesc !== false) && !small

  return {
    ...p, index, num: String(index + 1).padStart(2, '0'),
    wasText: money(p.was), nowText: money(p.now), nowInt, nowCents, savePct,
    payIn4: money(p.now / 4),
    imgBg, cellBg, cellText, border, pillBg, pillText, usePill, plainPrice: !usePill, descCol, strikeCol,
    showTopStripe: showTopStripe && !row,
    cellDir: row ? 'row' : 'column',
    imgFlex: row ? '0 0 92px' : '1 1 auto', imgMinH: row ? '0px' : '34px',
    infoFlex: row ? '1 1 auto' : '0 0 auto', infoPad: padMap[padv] ?? padMap[1],
    cellRadius: radius, cellOpacity: opacity, nameWeight,
    nameTransform: ov.upper ? 'uppercase' : 'none',
    colSpan: ov.span2 ? 'span 2' : 'span 1',
    align: curAlign,
    justify: curAlign === 'center' ? 'center' : (curAlign === 'right' ? 'flex-end' : 'flex-start'),
    showImage: fImage, imgLabel: p.blank ? 'IMAGE' : 'PRODUCT SHOT',
    showTitle: fTitle,
    nameDisplay: hasName ? p.name : (p.blank ? 'Product title' : 'Untitled deal'),
    nameColor: hasName ? 'inherit' : placeholderCol,
    isEditingName: editingName, notEditingName: !editingName,
    isEditingDesc: editingDesc, notEditingDesc: !editingDesc,
    descDisplay: hasDesc ? p.desc : 'Add a description',
    descColShown: hasDesc ? descCol : placeholderCol,
    showDesc: showDescField,
    showText: fText && !small,
    textDisplay: (p.text && p.text.trim()) ? p.text : 'Body text — add details, terms or a callout.',
    showPrice: fPrice, pricePlaceholder: fPrice && !hasNow,
    showDiscountRow: fDiscount && hasWas && Number(p.was) > Number(p.now) && hasNow,
    showBadge: p.showBadge !== false && savePct > 0 && fImage,
    showChips: tpl === 'spec' && tk.cols <= 2 && !invert && fPrice,
    hasTag: !!p.tag, tagText: p.tag?.t ?? '',
    tagBg: p.tag ? (p.tag.col === 'custom' ? (p.tag.customCol ?? '#666666') : (TAGCOL[p.tag.col] ?? '#211D17')) : '#211D17',
    ringStyle: bs,
    imageUrl: p.imageUrl,
    cellDraggable: !editing,
    dragOpacity: p.id === dragId ? '0.45' : '1',
    nameF, saveDim, saveLblF, savePctF, priceIntF, priceCentF,
  }
}
