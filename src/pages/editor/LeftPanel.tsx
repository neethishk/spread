import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent, computePageDimensions, gridTokens } from './helpers'
import { COMPONENT_TEMPLATES, COMPONENT_CATEGORIES, ACCENT_PLACEHOLDER, type ComponentTemplate } from './componentDefs'
import type { FreeElement, GridKey } from '../../types'

export default function LeftPanel() {
  const {
    leftTab, products, manualPages, gridKey, pageSize, orientation, template,
    selected, dragId, pageDragId, banners,
    accentKey, customAccent,
    activePageKey, pageElements, pageGrids,
    cardTemplate, cardTemplateMode, cardHiddenByProduct, contentPageDragIdx,
    set, addDeal, addBlank, addBlankPage, removeManualPage, reorder, reorderManualPages, addFreeEl,
    addCardTemplateEl, removeProductsInRange, moveProductRange,
  } = useStore(useShallow((s) => ({
    leftTab: s.leftTab, products: s.products, manualPages: s.manualPages,
    gridKey: s.gridKey, pageSize: s.pageSize,
    orientation: s.orientation, template: s.template,
    selected: s.selected, dragId: s.dragId, pageDragId: s.pageDragId,
    banners: s.banners,
    accentKey: s.accentKey, customAccent: s.customAccent,
    activePageKey: s.activePageKey, pageElements: s.pageElements, pageGrids: s.pageGrids,
    cardTemplate: s.cardTemplate, cardTemplateMode: s.cardTemplateMode,
    cardHiddenByProduct: s.cardHiddenByProduct, contentPageDragIdx: s.contentPageDragIdx,
    set: s.set, addDeal: s.addDeal, addBlank: s.addBlank, addBlankPage: s.addBlankPage,
    removeManualPage: s.removeManualPage, reorder: s.reorder, reorderManualPages: s.reorderManualPages,
    addFreeEl: s.addFreeEl, addCardTemplateEl: s.addCardTemplateEl,
    removeProductsInRange: s.removeProductsInRange, moveProductRange: s.moveProductRange,
  })))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageH } = computePageDimensions(pageSize, orientation)

  // Compute content page ranges accurately (respects per-page grid overrides)
  const pageRanges: Array<{ pIdx: number; startIdx: number; count: number }> = []
  {
    let gi = 0, pIdx = 0
    while (gi < products.length) {
      const gKey = (pageGrids[pIdx] as GridKey) ?? gridKey
      const tk = gridTokens(gKey, pageH, template)
      const count = Math.min(tk.perPage, products.length - gi)
      pageRanges.push({ pIdx, startIdx: gi, count })
      gi += tk.perPage; pIdx++
    }
  }
  if (pageRanges.length === 0) pageRanges.push({ pIdx: 0, startIdx: 0, count: 0 })

  const contentPageCount = pageRanges.length
  const totalPages = contentPageCount + 1 + manualPages.length

  const ban = banners[template] ?? { title: 'DEALS', sub: '' }

  const jumpTo = (id: string) => {
    const canvas = document.getElementById('sp-canvas')
    const el = document.getElementById(id)
    if (canvas && el) canvas.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }

  const segOn = { bg: '#fff', fg: '#211D17' }
  const segOff = { bg: 'transparent', fg: '#9A9182' }

  const activePageLabel =
    activePageKey === 'cover' ? 'Cover Page'
    : activePageKey.startsWith('pg-') ? `Page ${parseInt(activePageKey.slice(3)) + 2}`
    : (() => {
        const mp = manualPages.find((m) => m.id === activePageKey.slice(3))
        return mp ? (mp.title || 'Custom Page') : 'Custom Page'
      })()

  const handleAddComponent = (comp: ComponentTemplate) => {
    const fill = comp.el.fill === ACCENT_PLACEHOLDER ? accent : comp.el.fill
    const isBackground = comp.category === 'Backgrounds'

    if (cardTemplateMode) {
      const el: FreeElement = {
        ...comp.el, fill,
        id: 'ct' + Date.now(),
        zIndex: isBackground ? 0 : (cardTemplate.length + 1),
      }
      addCardTemplateEl(el)
      return
    }

    const el: FreeElement = {
      ...comp.el, fill,
      id: 'fe' + Date.now(),
      zIndex: isBackground ? 0 : (pageElements[activePageKey]?.length ?? 0) + 1,
    }
    addFreeEl(activePageKey, el)
  }

  const handleDeleteContentPage = (pIdx: number, startIdx: number, count: number) => {
    if (!window.confirm(`Delete page ${pIdx + 1}? This removes ${count} product${count !== 1 ? 's' : ''} from your catalog.`)) return
    removeProductsInRange(startIdx, count)
  }

  const handleContentPageDragEnter = (toPIdx: number) => {
    const fromPIdx = contentPageDragIdx
    if (fromPIdx === null || fromPIdx === toPIdx) return
    const from = pageRanges[fromPIdx]
    const to = pageRanges[toPIdx]
    if (!from || !to) return
    moveProductRange(from.startIdx, from.count, to.startIdx)
  }

  return (
    <div style={{ width: 288, flex: 'none', borderRight: '1px solid #EAE6DD', background: '#FBF9F4', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 3, padding: '12px 10px 0' }}>
        <button
          onClick={() => set({ leftTab: 'deals' })}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '8px 4px', borderRadius: '9px 9px 0 0', background: leftTab === 'deals' ? segOn.bg : segOff.bg, color: leftTab === 'deals' ? segOn.fg : segOff.fg }}
        >
          Deals
        </button>
        <button
          onClick={() => set({ leftTab: 'pages' })}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '8px 4px', borderRadius: '9px 9px 0 0', background: leftTab === 'pages' ? segOn.bg : segOff.bg, color: leftTab === 'pages' ? segOn.fg : segOff.fg }}
        >
          Pages
        </button>
        <button
          onClick={() => set({ leftTab: 'elements' })}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '8px 4px', borderRadius: '9px 9px 0 0', background: leftTab === 'elements' ? segOn.bg : segOff.bg, color: leftTab === 'elements' ? segOn.fg : segOff.fg }}
        >
          Design
        </button>
      </div>

      {/* DEALS TAB */}
      {leftTab === 'deals' && (
        <>
          <div style={{ padding: '16px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>Deals</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182', background: '#F0ECE3', padding: '3px 9px', borderRadius: 999 }}>{products.length}</span>
                <button
                  onClick={addBlank}
                  title="Add a blank element you design yourself"
                  style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', height: 26, padding: '0 9px', borderRadius: 8, fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: '#211D17' }}
                >
                  New Item
                </button>
                <button
                  onClick={addDeal}
                  title="Add deal"
                  style={{ border: 'none', cursor: 'pointer', width: 26, height: 26, borderRadius: 8, background: accent, color: '#fff', fontSize: 16, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E8E2D6', borderRadius: 10, padding: '8px 11px' }}>
              <span style={{ color: '#B7AE9E', fontSize: 14 }}>⌕</span>
              <input placeholder="Search deals" style={{ border: 'none', outline: 'none', background: 'none', fontFamily: 'inherit', fontSize: 13.5, color: '#211D17', width: '100%' }} />
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#B7AE9E', marginTop: 11, letterSpacing: '0.5px' }}>CLICK & HOLD TO REORDER · CLICK TO EDIT</div>
          </div>
          <div className="sp-scroll" style={{ flex: 1, overflow: 'auto', padding: '0 10px 12px' }}>
            {products.map((p, i) => {
              const isSel = selected?.type === 'product' && selected.id === p.id
              return (
                <div
                  key={p.id}
                  draggable
                  onDragStart={() => set({ dragId: p.id })}
                  onDragEnter={() => reorder(p.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDragEnd={() => set({ dragId: null })}
                  onClick={() => set({ selected: { type: 'product', id: p.id } })}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 9px', borderRadius: 11, cursor: 'grab', background: '#fff', boxShadow: isSel ? `0 0 0 2px ${accent}` : '0 0 0 1px #ECE8DF', marginBottom: 6, transition: 'box-shadow .15s ease', opacity: p.id === dragId ? 0.45 : 1 }}
                >
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#B7AE9E', width: 18, textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</span>
                  <div style={{ width: 40, height: 40, borderRadius: 7, background: '#F0ECE3', flex: 'none', border: '1px solid #ECE8DF' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name || (p.blank ? 'Blank element' : 'Untitled deal')}</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9A9182', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.category}</div>
                  </div>
                  <div style={{ textAlign: 'right', flex: 'none' }}>
                    <div style={{ fontSize: 10, color: '#B7AE9E', textDecoration: 'line-through' }}>${p.was.toFixed(2)}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: accent }}>${p.now.toFixed(2)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* PAGES TAB */}
      {leftTab === 'pages' && (
        <div className="sp-scroll" style={{ flex: 1, overflow: 'auto', padding: '14px 16px' }}>
          <button
            onClick={addBlankPage}
            style={{ width: '100%', border: '1px dashed #CFC8BA', background: '#fff', cursor: 'pointer', padding: 11, borderRadius: 11, fontFamily: 'inherit', fontSize: 13, fontWeight: 700, color: '#211D17', marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add blank page
          </button>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#B7AE9E', marginBottom: 12, letterSpacing: '0.5px' }}>
            DRAG TO REORDER · {totalPages} TOTAL PAGES
          </div>

          {/* Cover */}
          <PageNavItem
            id="sp-cover" label="Front Cover" pageNo="A" isCover isManual={false}
            draggable={false} dragOpacity={1} accent={accent}
            onJump={() => jumpTo('sp-cover')} onDelete={null}
          />

          {/* Content pages — draggable, deletable */}
          {pageRanges.map((pg) => (
            <PageNavItem
              key={pg.pIdx}
              id={`sp-pg-${pg.pIdx}`}
              label={ban.title}
              pageNo={String(pg.pIdx + 1)}
              isCover={false}
              isManual={false}
              draggable
              dragOpacity={contentPageDragIdx === pg.pIdx ? 0.45 : 1}
              accent={accent}
              onJump={() => jumpTo(`sp-pg-${pg.pIdx}`)}
              onDelete={(e) => { e.stopPropagation(); handleDeleteContentPage(pg.pIdx, pg.startIdx, pg.count) }}
              onDragStart={() => set({ contentPageDragIdx: pg.pIdx })}
              onDragEnter={() => handleContentPageDragEnter(pg.pIdx)}
              onDragEnd={() => set({ contentPageDragIdx: null })}
            />
          ))}

          {/* Manual pages */}
          {manualPages.map((mp, i) => (
            <PageNavItem
              key={mp.id} id={`sp-mp-${mp.id}`} label={mp.title || 'Blank page'} pageNo={`+${i + 1}`}
              isCover={false} isManual draggable
              dragOpacity={mp.id === pageDragId ? 0.45 : 1} accent={accent}
              onJump={() => jumpTo(`sp-mp-${mp.id}`)}
              onDragStart={() => set({ pageDragId: mp.id })}
              onDragEnter={() => reorderManualPages(mp.id)}
              onDragEnd={() => set({ pageDragId: null })}
              onDelete={(e) => { e.stopPropagation(); removeManualPage(mp.id) }}
            />
          ))}
        </div>
      )}

      {/* DESIGN TAB */}
      {leftTab === 'elements' && (
        <div className="sp-scroll" style={{ flex: 1, overflow: 'auto', padding: '12px 12px' }}>

          {/* Mode toggle: Page vs Card */}
          <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 10, padding: 3, marginBottom: 12 }}>
            <button
              onClick={() => set({ cardTemplateMode: false })}
              style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '7px 4px', borderRadius: 8, background: !cardTemplateMode ? '#fff' : 'transparent', color: !cardTemplateMode ? '#211D17' : '#9A9182' }}
            >
              Page
            </button>
            <button
              onClick={() => set({ cardTemplateMode: true })}
              style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, padding: '7px 4px', borderRadius: 8, background: cardTemplateMode ? '#fff' : 'transparent', color: cardTemplateMode ? '#211D17' : '#9A9182' }}
            >
              Card Template
            </button>
          </div>

          {/* Active context chip */}
          {cardTemplateMode ? (
            <div style={{ background: '#F7CC3A22', border: '1px solid #F7CC3A88', borderRadius: 9, padding: '7px 11px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4A500', flex: 'none' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#211D17', flex: 1 }}>
                Adding to: <span style={{ color: '#D4A500' }}>All Product Cards</span>
              </span>
              {cardTemplate.length > 0 && (
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#9A9182', background: '#F0ECE3', padding: '2px 6px', borderRadius: 5 }}>{cardTemplate.length} els</span>
              )}
            </div>
          ) : (
            <div style={{ background: accent + '18', border: `1px solid ${accent}44`, borderRadius: 9, padding: '7px 11px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, flex: 'none' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#211D17', flex: 1 }}>Adding to: <span style={{ color: accent }}>{activePageLabel}</span></span>
            </div>
          )}

          {/* Card template element list */}
          {cardTemplateMode && cardTemplate.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: '#B7AE9E', letterSpacing: '1.5px', marginBottom: 8, paddingLeft: 2 }}>CARD ELEMENTS</div>
              {cardTemplate.map((el) => {
                const hiddenCount = Object.values(cardHiddenByProduct).filter((ids) => ids.includes(el.id)).length
                return (
                  <div key={el.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 9, background: '#fff', boxShadow: '0 0 0 1px #ECE8DF', marginBottom: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, background: el.fill === 'transparent' ? '#F0ECE3' : el.fill, flex: 'none', border: '1px solid #ECE8DF' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{el.text || el.type}</div>
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: '#9A9182' }}>{el.type.toUpperCase()}{hiddenCount > 0 ? ` · hidden on ${hiddenCount}` : ''}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Component categories */}
          {COMPONENT_CATEGORIES.map((cat) => {
            const comps = COMPONENT_TEMPLATES.filter((c) => c.category === cat)
            return (
              <div key={cat} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: '#B7AE9E', letterSpacing: '1.5px', marginBottom: 8, paddingLeft: 2 }}>{cat.toUpperCase()}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {comps.map((comp) => (
                    <button
                      key={comp.id}
                      onClick={() => handleAddComponent(comp)}
                      title={comp.hint}
                      style={{ background: '#fff', border: '1.5px solid #E8E2D6', borderRadius: 10, padding: '0 0 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 0, textAlign: 'left', overflow: 'hidden', transition: 'border-color .12s, box-shadow .12s', fontFamily: 'inherit' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 1px ${accent}` }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#E8E2D6'; (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none' }}
                    >
                      <ComponentPreview comp={comp} accent={accent} />
                      <div style={{ padding: '6px 8px 0', fontSize: 11, fontWeight: 700, color: '#211D17', lineHeight: 1.2 }}>{comp.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Hint */}
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#C2BBA8', letterSpacing: '0.4px', textAlign: 'center', marginTop: 4, paddingBottom: 8 }}>
            CLICK ANY ELEMENT TO ADD IT
          </div>
        </div>
      )}
    </div>
  )
}

interface PageNavItemProps {
  id: string
  label: string
  pageNo: string
  isCover: boolean
  isManual: boolean
  draggable: boolean
  dragOpacity: number
  accent: string
  onJump: () => void
  onDelete: ((e: React.MouseEvent) => void) | null
  onDragStart?: () => void
  onDragEnter?: () => void
  onDragEnd?: () => void
}

function PageNavItem({ label, pageNo, isCover, isManual, draggable, dragOpacity, accent, onJump, onDelete, onDragStart, onDragEnter, onDragEnd }: PageNavItemProps) {
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      onClick={onJump}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 11, cursor: (isManual || draggable) ? 'grab' : 'pointer', background: '#fff', boxShadow: '0 0 0 1px #ECE8DF', marginBottom: 9, opacity: dragOpacity }}
    >
      <div style={{ width: 42, height: 58, flex: 'none', borderRadius: 4, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 4px rgba(33,29,23,.15)', position: 'relative' }}>
        {isCover && <div style={{ position: 'absolute', inset: 0, background: accent }} />}
        {isManual && <div style={{ position: 'absolute', inset: 6, border: '1px dashed #CFC8BA', borderRadius: 3 }} />}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 11, background: accent }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#9A9182', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page {pageNo}</div>
      </div>
      {onDelete && (
        <button onClick={onDelete} title="Delete page" style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 24, height: 24, borderRadius: 7, color: '#9A9182', fontSize: 12, flex: 'none' }}>✕</button>
      )}
    </div>
  )
}

function ComponentPreview({ comp, accent }: { comp: ComponentTemplate; accent: string }) {
  const fill = comp.el.fill === ACCENT_PLACEHOLDER ? accent : comp.el.fill
  const isCircle = comp.el.type === 'badge' || comp.el.type === 'sticker' || comp.el.type === 'ellipse'
  const isDivider = comp.id === 'divider'
  const isBackground = comp.category === 'Backgrounds'
  const H = 56

  if (isBackground) {
    return (
      <div style={{ width: '100%', height: H, background: fill, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {comp.el.type === 'image' ? (
          <span style={{ fontSize: 18, opacity: 0.5 }}>🖼</span>
        ) : (
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", color: fill === '#211D17' ? '#fff' : '#9A9182', letterSpacing: '1px', opacity: 0.6 }}>BG</div>
        )}
      </div>
    )
  }

  if (isDivider) {
    return (
      <div style={{ width: '100%', height: H, background: '#F8F6F2', display: 'flex', alignItems: 'center', padding: '0 10px' }}>
        <div style={{ width: '100%', height: 3, background: '#CFC8BA', borderRadius: 2 }} />
      </div>
    )
  }

  if (comp.el.type === 'image') {
    return (
      <div style={{ width: '100%', height: H, background: '#F0ECE3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 18, color: '#B7AE9E' }}>⊞</span>
        <span style={{ fontSize: 9, color: '#B7AE9E', fontFamily: "'Space Mono', monospace" }}>IMAGE</span>
      </div>
    )
  }

  if (isCircle) {
    const stroke = comp.el.stroke !== 'none' ? `${comp.el.strokeW}px solid ${comp.el.stroke}` : 'none'
    const sz = 46
    return (
      <div style={{ width: '100%', height: H, background: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: sz, height: sz, borderRadius: '50%', background: fill, border: stroke, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(33,29,23,.18)' }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: comp.el.type === 'sticker' ? 15 : 13, color: comp.el.fontColor, lineHeight: 0.95 }}>{comp.el.text}</div>
          {comp.el.text2 && <div style={{ fontSize: 8, fontWeight: 700, color: comp.el.fontColor, letterSpacing: '0.5px' }}>{comp.el.text2}</div>}
        </div>
      </div>
    )
  }

  if (comp.el.type === 'brand-header') {
    return (
      <div style={{ width: '100%', height: H, background: fill, display: 'flex', alignItems: 'center', paddingLeft: 10, overflow: 'hidden' }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, color: comp.el.fontColor, letterSpacing: '1px' }}>{comp.el.text}</div>
      </div>
    )
  }

  if (comp.el.type === 'promo-band') {
    return (
      <div style={{ width: '100%', height: H, background: fill, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 13, color: comp.el.fontColor, letterSpacing: '1px', transform: 'skewX(-5deg)' }}>{comp.el.text}</div>
        {comp.el.text2 && <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 9, color: comp.el.fontColor, opacity: 0.85, marginTop: 2 }}>{comp.el.text2}</div>}
      </div>
    )
  }

  if (comp.el.type === 'price-tag') {
    return (
      <div style={{ width: '100%', height: H, background: comp.el.fill, borderBottom: '2px solid #211D1722', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 10, overflow: 'hidden' }}>
        <div style={{ fontSize: 8, color: '#9A9182', textDecoration: 'line-through' }}>{comp.el.text2}</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, color: '#211D17', lineHeight: 0.95 }}>{comp.el.text3} {comp.el.text}</div>
      </div>
    )
  }

  if (comp.el.type === 'text') {
    return (
      <div style={{ width: '100%', height: H, background: '#F8F6F2', display: 'flex', alignItems: 'center', paddingLeft: 8, paddingRight: 6, overflow: 'hidden' }}>
        <div style={{ fontSize: comp.el.fontSize >= 30 ? 14 : 11, fontWeight: comp.el.bold ? 700 : 400, color: '#211D17', fontStyle: comp.el.italic ? 'italic' : 'normal', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{comp.el.text}</div>
      </div>
    )
  }

  // rect / ellipse / default
  return (
    <div style={{ width: '100%', height: H, borderRadius: comp.el.type === 'ellipse' ? '50%' : 0, background: fill, border: comp.el.stroke !== 'none' ? `1.5px solid ${comp.el.stroke}` : 'none' }} />
  )
}
