import { useStore } from '../../store'
import { computeAccent, computePageDimensions, gridTokens, enrichItem } from './helpers'
import type { GridKey } from '../../types'
import { GRIDS } from '../../constants'

export default function Canvas() {
  const {
    showRulers, showGuides, zoom, pageSize, orientation, template,
    products, manualPages, pageGrids, gridKey,
    cover, banners, badge, accentKey, customAccent,
    selected, editingId, dragId,
    set, stopEdit, liveProduct, startEdit, setPageGrid, setManualGrid, addDealToPage, reorder,
  } = useStore((s) => ({
    showRulers: s.showRulers, showGuides: s.showGuides, zoom: s.zoom,
    pageSize: s.pageSize, orientation: s.orientation, template: s.template,
    products: s.products, manualPages: s.manualPages, pageGrids: s.pageGrids, gridKey: s.gridKey,
    cover: s.cover, banners: s.banners, badge: s.badge,
    accentKey: s.accentKey, customAccent: s.customAccent,
    selected: s.selected, editingId: s.editingId, dragId: s.dragId,
    set: s.set, stopEdit: s.stopEdit, liveProduct: s.liveProduct,
    startEdit: s.startEdit, setPageGrid: s.setPageGrid, setManualGrid: s.setManualGrid,
    addDealToPage: s.addDealToPage, reorder: s.reorder,
  }))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageW, pageH, sizeLabel } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)
  const ban = banners[template] ?? { title: 'DEALS', sub: '' }

  const inspMode = !selected ? 'none' : (selected.type === 'product' ? 'product' : selected.type)

  // Paginate products into content pages
  const pages: { tk: ReturnType<typeof gridTokens>; gKey: GridKey; items: ReturnType<typeof enrichItem>[]; startIndex: number; pIdx: number }[] = []
  let gi = 0, pIdx = 0
  while (gi < products.length) {
    const gKey = (pageGrids[pIdx] as GridKey) ?? gridKey
    const tk = gridTokens(gKey, pageH, template)
    const slice = products.slice(gi, gi + tk.perPage)
    const enriched = slice.map((p, k) => enrichItem(p, gi + k, tk, template, ac, badge, selected?.type === 'product' ? selected.id ?? null : null, dragId, editingId))
    pages.push({ tk, gKey, items: enriched, startIndex: gi, pIdx })
    gi += tk.perPage; pIdx++
  }
  if (pages.length === 0) {
    const tk = gridTokens(gridKey, pageH, template)
    pages.push({ tk, gKey: gridKey, items: [], startIndex: 0, pIdx: 0 })
  }
  const contentPageCount = pages.length
  const totalPages = contentPageCount + 1 + manualPages.length

  // Cover sizing
  const coverMark = Math.round(pageW * 0.075)
  const coverMarkF = Math.round(pageW * 0.045)
  const coverBrandF = Math.max(15, Math.round(pageW * 0.045))
  const coverSmallF = Math.max(8, Math.round(pageW * 0.018))
  const coverH1 = Math.max(34, Math.round(pageW * 0.185))
  const coverBurstF = Math.max(14, Math.round(pageW * 0.05))
  const coverRing = inspMode === 'cover' ? `0 0 0 3px ${accent}, 0 10px 38px rgba(33,29,23,.14)` : '0 10px 38px rgba(33,29,23,.14)'
  const bannerRing = inspMode === 'banner' ? 'inset 0 0 0 3px #fff' : 'none'

  const deselect = (e: React.MouseEvent) => {
    if (editingId) return
    if (e.target === e.currentTarget) set({ selected: null })
  }

  const canvasCursor = {
    hand: 'grab', zoom: 'zoom-in', type: 'text', select: 'default',
  }['select'] ?? 'crosshair'

  const unitsLabel = pageSize === 'letter' ? 'in' : (pageSize === 'square' ? 'px' : 'mm')
  const colGuides = Array.from({ length: gtk.cols })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
      {showRulers && (
        <div style={{ flex: 'none', height: 22, display: 'flex', background: '#F2EFE8', borderBottom: '1px solid #E0DACE' }}>
          <div style={{ width: 22, flex: 'none', borderRight: '1px solid #E0DACE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#B7AE9E' }}>{unitsLabel}</div>
          <div style={{ flex: 1, backgroundImage: 'repeating-linear-gradient(90deg,#c2bba8 0 1px,transparent 1px 50px),repeating-linear-gradient(90deg,#e0dacd 0 1px,transparent 1px 10px)' }} />
        </div>
      )}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, minWidth: 0 }}>
        {showRulers && (
          <div style={{ width: 22, flex: 'none', background: '#F2EFE8', borderRight: '1px solid #E0DACE', backgroundImage: 'repeating-linear-gradient(0deg,#c2bba8 0 1px,transparent 1px 50px),repeating-linear-gradient(0deg,#e0dacd 0 1px,transparent 1px 10px)' }} />
        )}
        <div
          id="sp-canvas"
          onClick={deselect}
          className="sp-scroll"
          style={{ flex: 1, minWidth: 0, overflow: 'auto', background: '#E9E5DC', padding: '38px 32px 80px', cursor: canvasCursor }}
        >
          {/* Hint bar */}
          {inspMode === 'none' && (
            <div style={{ maxWidth: pageW, margin: '0 auto 22px', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontSize: 12.5, color: '#8A8276', background: '#F2EFE8', border: '1px solid #E0DACE', borderRadius: 999, padding: '8px 16px', width: 'fit-content' }}>
              <span style={{ color: accent }}>✎</span> Click any deal to edit · double-click text to rename · drag to reorder
            </div>
          )}

          <div style={{ width: pageW, margin: '0 auto', zoom }}>

            {/* COVER PAGE */}
            <div
              id="sp-cover"
              onClick={(e) => { e.stopPropagation(); set({ selected: { type: 'cover' } }) }}
              style={{ width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: coverRing, overflow: 'hidden', marginBottom: 26, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ flex: 1, background: accent, color: '#fff', padding: '7% 8% 8%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '3%' }}>
                    <div style={{ width: coverMark, height: coverMark, borderRadius: '24%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontFamily: "'Anton', sans-serif", fontSize: coverMarkF }}>G</div>
                    <div style={{ lineHeight: 1.05 }}>
                      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: coverBrandF, letterSpacing: '0.5px' }}>{cover.brand}</div>
                      <div style={{ fontSize: coverSmallF, opacity: 0.85, letterSpacing: '1px', marginTop: 3 }}>WHERE VALUE LIVES</div>
                    </div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.4)', borderRadius: 999, padding: '6px 13px', fontFamily: "'Space Mono', monospace", fontSize: coverSmallF, letterSpacing: '0.5px' }}>{cover.validity}</div>
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: coverH1, lineHeight: 0.9, transform: 'skewX(-7deg)', transformOrigin: 'left' }}>{cover.headline1}<br />{cover.headline2}</div>
                  <div style={{ display: 'inline-block', marginTop: '5%', background: badge, color: '#211D17', fontFamily: "'Anton', sans-serif", fontSize: coverBurstF, padding: '1.5% 4%', borderRadius: 8, transform: 'skewX(-7deg)' }}>{cover.burst}</div>
                </div>
              </div>
              <div style={{ padding: '3% 8%', display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: coverSmallF, color: '#9A9182', letterSpacing: '0.5px' }}>
                <span>{products.length} DEALS</span><span>{totalPages} PAGES</span><span>MADE WITH SPREAD</span>
              </div>
            </div>

            {/* CONTENT PAGES */}
            {pages.map((pg, pgI) => (
              <div
                key={pgI}
                id={`sp-pg-${pgI}`}
                style={{ position: 'relative', width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: '0 10px 30px rgba(33,29,23,.12)', overflow: 'hidden', marginBottom: 26, display: 'flex', flexDirection: 'column' }}
              >
                {showGuides && (
                  <div style={{ position: 'absolute', inset: '16px 18px', pointerEvents: 'none', zIndex: 4, outline: '1px solid rgba(0,160,235,.55)', display: 'flex', gap: 11 }}>
                    {colGuides.map((_, i) => <div key={i} style={{ flex: 1, borderLeft: '1px solid rgba(235,0,150,.18)', borderRight: '1px solid rgba(235,0,150,.18)' }} />)}
                  </div>
                )}
                {/* Banner */}
                <div
                  onClick={(e) => { e.stopPropagation(); set({ selected: { type: 'banner' } }) }}
                  style={{ flex: 'none', background: accent, color: '#fff', padding: '9px 12px 9px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', boxShadow: bannerRing }}
                >
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, transform: 'skewX(-7deg)', display: 'inline-block' }}>{ban.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <GridSelector gKey={pg.gKey} accent={accent} onChange={(gk) => setPageGrid(pg.pIdx, gk)} />
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, opacity: 0.9, letterSpacing: '1px', whiteSpace: 'nowrap' }}>PAGE {pg.pIdx + 1}/{contentPageCount}</span>
                  </div>
                </div>
                {/* Cells grid */}
                <div
                  style={{ flex: 1, padding: '16px 18px', display: 'grid', gridTemplateColumns: pg.tk.gridCols, gridAutoRows: pg.tk.cellRowH, alignContent: 'flex-start', gap: pg.tk.cellGap, minHeight: 0, overflow: 'hidden' }}
                >
                  {pg.items.map((item) => (
                    <ProductCell
                      key={item.id} item={item} accent={accent} badge={badge}
                      onSelect={(e) => { e.stopPropagation(); set({ selected: { type: 'product', id: item.id } }) }}
                      onDblName={(e) => { e.stopPropagation(); startEdit(item.id, 'name') }}
                      onDblDesc={(e) => { e.stopPropagation(); startEdit(item.id, 'desc') }}
                      onDragStart={() => set({ dragId: item.id })}
                      onDragEnter={() => reorder(item.id)}
                      onDragEnd={() => set({ dragId: null })}
                      onEditName={(v) => liveProduct(item.id, { name: v })}
                      onEditDesc={(v) => liveProduct(item.id, { desc: v })}
                      onBlur={() => stopEdit()}
                    />
                  ))}
                </div>
                {/* Footer */}
                <div style={{ flex: 'none', padding: '7px 22px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: '#B7AE9E', letterSpacing: '0.5px', borderTop: '1px solid #F0ECE3' }}>
                  <span>{cover.brand} · WHILE STOCKS LAST</span><span>{sizeLabel} · PAGE {pgI + 2}</span>
                </div>
              </div>
            ))}

            {/* MANUAL PAGES */}
            {manualPages.map((mp) => {
              const gKey = (mp.gridKey as GridKey) ?? gridKey
              const tk = gridTokens(gKey, pageH, template)
              const items = (mp.items ?? []).map((p, k) => enrichItem(p, k, tk, template, ac, badge, selected?.type === 'product' ? selected.id ?? null : null, dragId, editingId))
              return (
                <div
                  key={mp.id}
                  id={`sp-mp-${mp.id}`}
                  style={{ position: 'relative', width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: '0 10px 30px rgba(33,29,23,.12)', overflow: 'hidden', marginBottom: 26, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ flex: 'none', background: accent, color: '#fff', padding: '9px 12px 9px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, transform: 'skewX(-7deg)', display: 'inline-block' }}>{mp.title || 'NEW PAGE'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                      <GridSelector gKey={gKey} accent={accent} onChange={(gk) => setManualGrid(mp.id, gk)} />
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9.5, opacity: 0.9, letterSpacing: '1px', whiteSpace: 'nowrap' }}>CUSTOM</span>
                    </div>
                  </div>
                  {items.length === 0 ? (
                    <div onClick={(e) => { e.stopPropagation(); addDealToPage(mp.id) }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <div style={{ border: '2px dashed #D5CEC1', borderRadius: 14, padding: '34px 52px', textAlign: 'center', color: '#B7AE9E', fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1px', lineHeight: 2 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 11, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px' }}>+</div>
                        CLICK TO ADD A DEAL<br /><span style={{ fontSize: 10 }}>empty element you design</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ flex: 1, padding: '16px 18px', display: 'grid', gridTemplateColumns: tk.gridCols, gridAutoRows: tk.cellRowH, alignContent: 'flex-start', gap: tk.cellGap, minHeight: 0, overflow: 'hidden' }}>
                      {items.map((item) => (
                        <ProductCell
                          key={item.id} item={item} accent={accent} badge={badge}
                          onSelect={(e) => { e.stopPropagation(); set({ selected: { type: 'product', id: item.id } }) }}
                          onDblName={(e) => { e.stopPropagation(); startEdit(item.id, 'name') }}
                          onDblDesc={(e) => { e.stopPropagation(); startEdit(item.id, 'desc') }}
                          onDragStart={() => set({ dragId: item.id })}
                          onDragEnter={() => reorder(item.id)}
                          onDragEnd={() => set({ dragId: null })}
                          onEditName={(v) => liveProduct(item.id, { name: v })}
                          onEditDesc={(v) => liveProduct(item.id, { desc: v })}
                          onBlur={() => stopEdit()}
                        />
                      ))}
                      <div onClick={(e) => { e.stopPropagation(); addDealToPage(mp.id) }} title="Add a deal to this page" style={{ gridColumn: 'span 1', border: '2px dashed #D5CEC1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: '#B7AE9E', minHeight: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>+</div>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '1px' }}>ADD DEAL</span>
                      </div>
                    </div>
                  )}
                  <div style={{ flex: 'none', padding: '7px 22px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 9.5, color: '#B7AE9E', letterSpacing: '0.5px', borderTop: '1px solid #F0ECE3' }}>
                    <span>{cover.brand} · CUSTOM PAGE</span><span>{sizeLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Grid selector pill in page banner
function GridSelector({ gKey, accent, onChange }: { gKey: GridKey; accent: string; onChange: (k: GridKey) => void }) {
  return (
    <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,.14)', borderRadius: 8, padding: 2 }} title="Grid for this page">
      {Object.keys(GRIDS).map((k) => (
        <button
          key={k}
          onClick={(e) => { e.stopPropagation(); onChange(k as GridKey) }}
          style={{ border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 9.5, fontWeight: 700, padding: '3px 7px', borderRadius: 6, background: k === gKey ? '#fff' : 'transparent', color: k === gKey ? accent : 'rgba(255,255,255,.82)' }}
        >
          {k.replace('x', '×')}
        </button>
      ))}
    </div>
  )
}

// Individual product cell
interface ProductCellProps {
  item: ReturnType<typeof enrichItem>
  accent: string
  badge: string
  onSelect: (e: React.MouseEvent) => void
  onDblName: (e: React.MouseEvent) => void
  onDblDesc: (e: React.MouseEvent) => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  onEditName: (v: string) => void
  onEditDesc: (v: string) => void
  onBlur: () => void
}

function ProductCell({ item, accent, badge, onSelect, onDblName, onDblDesc, onDragStart, onDragEnter, onDragEnd, onEditName, onEditDesc, onBlur }: ProductCellProps) {
  const focusRef = (el: HTMLInputElement | null) => {
    if (el) { el.focus(); try { const v = el.value; el.setSelectionRange(v.length, v.length) } catch (_) {} }
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDblName}
      draggable={item.cellDraggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className="sp-cell"
      style={{ gridColumn: item.colSpan, border: item.border, borderRadius: item.cellRadius, overflow: 'hidden', background: item.cellBg, color: item.cellText, opacity: item.cellOpacity, cursor: 'grab', boxShadow: item.ringStyle, display: 'flex', flexDirection: item.cellDir, minHeight: 0 }}
    >
      {item.showTopStripe && <div style={{ height: 4, background: accent, flex: 'none' }} />}
      {item.showImage && (
        <div style={{ flex: item.imgFlex, background: item.imgBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: item.imgMinH }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#B7AE9E', letterSpacing: '1px' }}>{item.imgLabel}</span>
          {item.showBadge && (
            <div style={{ position: 'absolute', top: 6, right: 6, width: item.saveDim, height: item.saveDim, borderRadius: '50%', background: badge, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1, boxShadow: '0 2px 6px rgba(33,29,23,.2)' }}>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 800, fontSize: item.saveLblF, color: '#211D17' }}>SAVE</span>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.savePctF, color: '#211D17' }}>{item.savePct}%</span>
            </div>
          )}
          {item.hasTag && (
            <div style={{ position: 'absolute', top: 8, left: 8, background: item.tagBg, color: '#fff', fontWeight: 700, fontSize: 9, padding: '3px 8px', borderRadius: 999 }}>{item.tagText}</div>
          )}
        </div>
      )}
      <div style={{ padding: item.infoPad, flex: item.infoFlex, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: item.align as any }}>
        {item.showTitle && (
          item.isEditingName ? (
            <input
              ref={focusRef}
              defaultValue={item.name}
              onChange={(e) => onEditName(e.target.value)}
              onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur() }}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'inherit', fontWeight: item.nameWeight, fontSize: item.nameF, lineHeight: 1.15, marginBottom: 2, border: 'none', outline: `2px solid ${accent}`, borderRadius: 4, padding: '1px 3px', width: '100%', background: '#fff', color: '#211D17' }}
            />
          ) : (
            <div style={{ fontWeight: item.nameWeight, textTransform: item.nameTransform as any, fontSize: item.nameF, lineHeight: 1.15, marginBottom: 2, color: item.nameColor }}>{item.nameDisplay}</div>
          )
        )}
        {item.showDesc && (
          item.isEditingDesc ? (
            <input
              ref={focusRef}
              defaultValue={item.desc}
              onChange={(e) => onEditDesc(e.target.value)}
              onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur() }}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'inherit', fontSize: 11, marginBottom: 6, border: 'none', outline: `2px solid ${accent}`, borderRadius: 4, padding: '1px 3px', width: '100%', background: '#fff', color: '#211D17' }}
            />
          ) : (
            <div onDoubleClick={onDblDesc} style={{ fontSize: 11, color: item.descColShown, marginBottom: 6 }}>{item.descDisplay}</div>
          )
        )}
        {item.showText && (
          <div style={{ fontSize: 10.5, color: item.descCol, marginBottom: 6, lineHeight: 1.4 }}>{item.textDisplay}</div>
        )}
        {item.showChips && (
          <div style={{ display: 'flex', gap: 5, margin: '5px 0 7px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, background: '#F0ECE3', color: '#211D17', borderRadius: 5, padding: '3px 6px' }}>Pay 4× ${(item.now / 4).toFixed(2)}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, background: '#F0ECE3', color: '#211D17', borderRadius: 5, padding: '3px 6px' }}>0% EMI</span>
          </div>
        )}
        {item.showPrice && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, justifyContent: item.justify, marginTop: 4 }}>
            {item.showDiscountRow && <span style={{ fontSize: 11, color: item.strikeCol, textDecoration: 'line-through', paddingBottom: 4 }}>{item.wasText}</span>}
            {item.pricePlaceholder && <div style={{ border: '1px dashed #CFC8BA', borderRadius: 7, padding: '3px 10px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#B7AE9E', letterSpacing: '1px' }}>PRICE</div>}
            {item.usePill && !item.pricePlaceholder && (
              <div style={{ background: item.pillBg, color: item.pillText, borderRadius: 8, padding: '3px 9px 4px', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 700, alignSelf: 'flex-start', marginTop: 2 }}>$</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceIntF, lineHeight: 0.9 }}>{item.nowInt}</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceCentF }}>{item.nowCents}</span>
              </div>
            )}
            {item.plainPrice && !item.pricePlaceholder && (
              <div style={{ color: accent, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                <span style={{ fontSize: 11, fontWeight: 700, alignSelf: 'flex-start', marginTop: 2 }}>$</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceIntF, lineHeight: 0.9 }}>{item.nowInt}</span>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceCentF }}>{item.nowCents}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
