import { useState } from 'react'
import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent, computePageDimensions, gridTokens, enrichItem } from './helpers'
import type { GridKey } from '../../types'
import FreeLayer from './FreeLayer'
import ContextMenu from './ContextMenu'

export default function Canvas() {
  const {
    showRulers, showGuides, zoom, pageSize, orientation, template,
    products, manualPages, pageGrids, gridKey,
    cover, banners, badge, accentKey, customAccent,
    selected, editingId, dragId,
    cardTemplate, cardHiddenByProduct, cardTemplateMode,
    set, stopEdit, liveProduct, startEdit, addDealToPage, reorder,
    tool, duplicateProduct, removeProduct, updateOv,
  } = useStore(useShallow((s) => ({
    showRulers: s.showRulers, showGuides: s.showGuides, zoom: s.zoom,
    pageSize: s.pageSize, orientation: s.orientation, template: s.template,
    products: s.products, manualPages: s.manualPages, pageGrids: s.pageGrids, gridKey: s.gridKey,
    cover: s.cover, banners: s.banners, badge: s.badge,
    accentKey: s.accentKey, customAccent: s.customAccent,
    selected: s.selected, editingId: s.editingId, dragId: s.dragId,
    cardTemplate: s.cardTemplate, cardHiddenByProduct: s.cardHiddenByProduct,
    cardTemplateMode: s.cardTemplateMode,
    tool: s.tool,
    set: s.set, stopEdit: s.stopEdit, liveProduct: s.liveProduct,
    startEdit: s.startEdit, addDealToPage: s.addDealToPage, reorder: s.reorder,
    duplicateProduct: s.duplicateProduct, removeProduct: s.removeProduct, updateOv: s.updateOv,
  })))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageW, pageH } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)
  const ban = banners[template] ?? { title: 'DEALS', sub: '' }

  const inspMode = !selected ? 'none' : (selected.type === 'product' ? 'product' : selected.type)

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; item: ReturnType<typeof enrichItem> } | null>(null)

  const handleProductContextMenu = (e: React.MouseEvent, item: ReturnType<typeof enrichItem>) => {
    e.preventDefault()
    e.stopPropagation()
    set({ selected: { type: 'product', id: item.id }, selectedFreeIds: [] })
    setCtxMenu({ x: e.clientX, y: e.clientY, item })
  }

  const buildProductMenuItems = (item: ReturnType<typeof enrichItem>) => {
    const ov = item.ov ?? {}
    return [
      { icon: '⧉', label: 'Duplicate Deal', onClick: () => duplicateProduct(item.id) },
      { icon: '✕', label: 'Delete Deal', danger: true, onClick: () => removeProduct(item.id) },
      { separator: true },
      { icon: '↔', label: ov.span2 ? 'Shrink to 1 Column' : 'Span 2 Columns', onClick: () => updateOv(item.id, { span2: !ov.span2 }) },
      { separator: true },
      {
        icon: '✏️',
        label: 'Align Left',
        disabled: (ov.align ?? item.align) === 'left',
        onClick: () => updateOv(item.id, { align: 'left' }),
      },
      {
        icon: '✏️',
        label: 'Align Center',
        disabled: (ov.align ?? item.align) === 'center',
        onClick: () => updateOv(item.id, { align: 'center' }),
      },
      {
        icon: '✏️',
        label: 'Align Right',
        disabled: (ov.align ?? item.align) === 'right',
        onClick: () => updateOv(item.id, { align: 'right' }),
      },
      { separator: true },
      {
        icon: '🎨',
        label: 'Set White Background',
        onClick: () => updateOv(item.id, { bg: 'white' }),
      },
      {
        icon: '🎨',
        label: 'Set Cream Background',
        onClick: () => updateOv(item.id, { bg: 'cream' }),
      },
      {
        icon: '🎨',
        label: 'Set Tint Background',
        onClick: () => updateOv(item.id, { bg: 'tint' }),
      },
      {
        icon: '🎨',
        label: 'Set Accent Background',
        onClick: () => updateOv(item.id, { bg: 'accent' }),
      },
    ]
  }

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
    if (e.target === e.currentTarget) set({ selected: null, selectedFreeIds: [] })
  }

  const canvasCursor = ({ hand: 'grab', zoom: 'zoom-in', type: 'crosshair', rect: 'crosshair', ellipse: 'crosshair', image: 'crosshair', select: 'default' } as Record<string, string>)[tool] ?? 'default'

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
              onPointerDown={(e) => { e.stopPropagation(); set({ selected: { type: 'cover' }, selectedFreeIds: [], activePageKey: 'cover', freeElPageKey: null }) }}
              style={{ position: 'relative', width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: coverRing, overflow: 'hidden', marginBottom: 26, cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
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
              <FreeLayer pageKey="cover" pageW={pageW} pageH={pageH} accent={accent} />
            </div>

            {/* CONTENT PAGES */}
            {pages.map((pg, pgI) => (
              <div
                key={pgI}
                id={`sp-pg-${pgI}`}
                onClick={() => set({ activePageKey: `pg-${pgI}`, selected: { type: 'page', pIdx: pgI } })}
                style={{ position: 'relative', width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: '0 10px 30px rgba(33,29,23,.12)', overflow: 'hidden', marginBottom: 26, display: 'flex', flexDirection: 'column' }}
              >
                {showGuides && (
                  <div style={{ position: 'absolute', inset: '16px 18px', pointerEvents: 'none', zIndex: 4, outline: '1px solid rgba(0,160,235,.55)', display: 'flex', gap: 11 }}>
                    {colGuides.map((_, i) => <div key={i} style={{ flex: 1, borderLeft: '1px solid rgba(235,0,150,.18)', borderRight: '1px solid rgba(235,0,150,.18)' }} />)}
                  </div>
                )}
                {/* Banner */}
                <div
                  onPointerDown={(e) => { e.stopPropagation(); set({ selected: { type: 'banner' }, selectedFreeIds: [], freeElPageKey: null }) }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ flex: 'none', background: accent, color: '#fff', padding: '9px 12px 9px 22px', display: 'flex', alignItems: 'center', cursor: 'pointer', boxShadow: bannerRing }}
                >
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, transform: 'skewX(-7deg)', display: 'inline-block' }}>{ban.title}</span>
                </div>
                {/* Cells grid */}
                <div
                  style={{ flex: 1, padding: '16px 18px', display: 'grid', gridTemplateColumns: pg.tk.gridCols, gridAutoRows: pg.tk.cellRowH, alignContent: 'flex-start', gap: pg.tk.cellGap, minHeight: 0, overflow: 'hidden' }}
                >
                  {pg.items.map((item) => (
                    <ProductCell
                      key={item.id} item={item} accent={accent} badge={badge}
                      cardTemplate={cardTemplate} hiddenCardEls={cardHiddenByProduct[item.id] ?? []}
                      cardTemplateMode={cardTemplateMode}
                      onSelect={(e) => { e.stopPropagation(); set({ selected: { type: 'product', id: item.id }, selectedFreeIds: [] }) }}
                      onDblName={(e) => { e.stopPropagation(); startEdit(item.id, 'name') }}
                      onDblDesc={(e) => { e.stopPropagation(); startEdit(item.id, 'desc') }}
                      onDblWas={(e) => { e.stopPropagation(); startEdit(item.id, 'was') }}
                      onDblNow={(e) => { e.stopPropagation(); startEdit(item.id, 'now') }}
                      onDblBodyText={(e) => { e.stopPropagation(); startEdit(item.id, 'text') }}
                      onDragStart={() => set({ dragId: item.id })}
                      onDragEnter={() => reorder(item.id)}
                      onDragEnd={() => set({ dragId: null })}
                      onEditName={(v) => liveProduct(item.id, { name: v })}
                      onEditDesc={(v) => liveProduct(item.id, { desc: v })}
                      onEditWas={(v) => liveProduct(item.id, { was: v })}
                      onEditNow={(v) => liveProduct(item.id, { now: v })}
                      onEditText={(v) => liveProduct(item.id, { text: v })}
                      onBlur={() => stopEdit()}
                      onContextMenu={(e) => handleProductContextMenu(e, item)}
                    />
                  ))}
                </div>
                <FreeLayer pageKey={`pg-${pgI}`} pageW={pageW} pageH={pageH} accent={accent} />
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
                  onClick={() => set({ activePageKey: `mp-${mp.id}`, selected: { type: 'page', mpId: mp.id } })}
                  style={{ position: 'relative', width: pageW, height: pageH, background: '#fff', borderRadius: 4, boxShadow: '0 10px 30px rgba(33,29,23,.12)', overflow: 'hidden', marginBottom: 26, display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ flex: 'none', background: accent, color: '#fff', padding: '9px 12px 9px 22px', display: 'flex', alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, transform: 'skewX(-7deg)', display: 'inline-block' }}>{mp.title || 'NEW PAGE'}</span>
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
                          cardTemplate={cardTemplate} hiddenCardEls={cardHiddenByProduct[item.id] ?? []}
                          cardTemplateMode={cardTemplateMode}
                          onSelect={(e) => { e.stopPropagation(); set({ selected: { type: 'product', id: item.id }, selectedFreeIds: [] }) }}
                          onDblName={(e) => { e.stopPropagation(); startEdit(item.id, 'name') }}
                          onDblDesc={(e) => { e.stopPropagation(); startEdit(item.id, 'desc') }}
                          onDblWas={(e) => { e.stopPropagation(); startEdit(item.id, 'was') }}
                          onDblNow={(e) => { e.stopPropagation(); startEdit(item.id, 'now') }}
                          onDblBodyText={(e) => { e.stopPropagation(); startEdit(item.id, 'text') }}
                          onDragStart={() => set({ dragId: item.id })}
                          onDragEnter={() => reorder(item.id)}
                          onDragEnd={() => set({ dragId: null })}
                          onEditName={(v) => liveProduct(item.id, { name: v })}
                          onEditDesc={(v) => liveProduct(item.id, { desc: v })}
                          onEditWas={(v) => liveProduct(item.id, { was: v })}
                          onEditNow={(v) => liveProduct(item.id, { now: v })}
                          onEditText={(v) => liveProduct(item.id, { text: v })}
                          onBlur={() => stopEdit()}
                          onContextMenu={(e) => handleProductContextMenu(e, item)}
                        />
                      ))}
                      <div onClick={(e) => { e.stopPropagation(); addDealToPage(mp.id) }} title="Add a deal to this page" style={{ gridColumn: 'span 1', border: '2px dashed #D5CEC1', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, cursor: 'pointer', color: '#B7AE9E', minHeight: 0 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19 }}>+</div>
                        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: '1px' }}>ADD DEAL</span>
                      </div>
                    </div>
                  )}
                  <FreeLayer pageKey={`mp-${mp.id}`} pageW={pageW} pageH={pageH} accent={accent} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={buildProductMenuItems(ctxMenu.item)}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  )
}


// Individual product cell
interface ProductCellProps {
  item: ReturnType<typeof enrichItem>
  accent: string
  badge: string
  cardTemplate: import('../../types').FreeElement[]
  hiddenCardEls: string[]
  cardTemplateMode: boolean
  onSelect: (e: React.MouseEvent) => void
  onDblName: (e: React.MouseEvent) => void
  onDblDesc: (e: React.MouseEvent) => void
  onDblWas: (e: React.MouseEvent) => void
  onDblNow: (e: React.MouseEvent) => void
  onDblBodyText: (e: React.MouseEvent) => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  onEditName: (v: string) => void
  onEditDesc: (v: string) => void
  onEditWas: (v: number) => void
  onEditNow: (v: number) => void
  onEditText: (v: string) => void
  onBlur: () => void
  onContextMenu: (e: React.MouseEvent) => void
}

function ProductCell({
  item, accent, badge: _badge, cardTemplate, hiddenCardEls, cardTemplateMode,
  onSelect, onDblName, onDblDesc,
  onDblWas, onDblNow, onDblBodyText,
  onDragStart, onDragEnter, onDragEnd,
  onEditName, onEditDesc, onEditWas, onEditNow, onEditText,
  onBlur, onContextMenu
}: ProductCellProps) {
  const focusRef = (el: HTMLInputElement | null) => {
    if (el) { el.focus(); try { const v = el.value; el.setSelectionRange(v.length, v.length) } catch (_) {} }
  }

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDblName}
      onContextMenu={onContextMenu}
      draggable={item.cellDraggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragEnd={onDragEnd}
      className="sp-cell"
      style={{ gridColumn: item.colSpan, border: item.border, borderRadius: item.cellRadius, overflow: 'hidden', background: item.cellBg, color: item.cellText, opacity: item.cellOpacity, cursor: 'grab', boxShadow: item.ringStyle, display: 'flex', flexDirection: item.cellDir, minHeight: 0, position: 'relative' }}
    >
      {/* Card template overlay */}
      {cardTemplate.length > 0 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, outline: cardTemplateMode ? '2px dashed #F7CC3A' : 'none' }}>
          {cardTemplate.map((el) => {
            if (hiddenCardEls.includes(el.id)) return null
            const style: React.CSSProperties = {
              position: 'absolute',
              left: `${el.x}%`, top: `${el.y}%`,
              width: `${el.w}%`, height: `${el.h}%`,
              opacity: el.opacity,
              zIndex: el.zIndex,
            }
            if (el.type === 'rect' || el.type === 'ellipse') {
              return (
                <div key={el.id} style={{ ...style, background: el.fill, borderRadius: el.type === 'ellipse' ? '50%' : 4, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none' }}>
                  {el.text && <span style={{ fontSize: el.fontSize * 0.25, color: el.fontColor, padding: '0 4px' }}>{el.text}</span>}
                </div>
              )
            }
            if (el.type === 'text') {
              return (
                <div key={el.id} style={{ ...style, fontSize: el.fontSize * 0.25, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.fontColor, textAlign: el.textAlign, display: 'flex', alignItems: 'center', padding: '0 4px', lineHeight: 1.2 }}>
                  {el.text}
                </div>
              )
            }
            if (el.type === 'image') {
              return (
                <div key={el.id} style={{ ...style, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', overflow: 'hidden' }}>
                  {el.imageUrl && <img src={el.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: el.fit }} crossOrigin="anonymous" />}
                </div>
              )
            }
            return <div key={el.id} style={{ ...style, background: el.fill, borderRadius: 3 }} />
          })}
        </div>
      )}
      {item.showTopStripe && <div style={{ height: 4, background: accent, flex: 'none' }} />}
      {item.showImage && (
        <div style={{ flex: item.imgFlex, background: item.imgBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: item.imgMinH, overflow: 'hidden' }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name} crossOrigin="anonymous" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 8, color: '#B7AE9E', letterSpacing: '1px' }}>{item.imgLabel}</span>
          }
          {item.showBadge && (
            <div style={{
              position: 'absolute',
              top: `${item.badgeY}px`,
              right: `${item.badgeX}px`,
              width: `${item.badgeSize}px`,
              height: `${item.badgeSize}px`,
              borderRadius: item.badgeShape === 'circle' ? '50%' : (item.badgeShape === 'rounded' ? '8px' : '0px'),
              clipPath: item.badgeShape === 'star'
                ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
                : item.badgeShape === 'burst'
                ? 'polygon(50% 0%, 58% 12%, 73% 7%, 75% 22%, 90% 21%, 86% 36%, 98% 43%, 89% 55%, 95% 70%, 82% 75%, 83% 90%, 69% 89%, 66% 99%, 52% 93%, 44% 99%, 33% 91%, 23% 94%, 18% 81%, 5% 78%, 10% 64%, 2% 52%, 12% 41%, 8% 26%, 22% 23%, 24% 8%, 38% 11%, 42% 1%)'
                : 'none',
              background: item.badgeBg,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              lineHeight: 1,
              boxShadow: item.badgeShape === 'star' || item.badgeShape === 'burst' ? 'none' : '0 2px 6px rgba(33,29,23,.2)'
            }}>
              <span style={{ fontFamily: "'Hanken Grotesk', sans-serif", fontWeight: 800, fontSize: Math.max(6, item.badgeSize * 0.2), color: '#211D17' }}>SAVE</span>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: Math.max(10, item.badgeSize * 0.35), color: '#211D17' }}>{item.savePct}%</span>
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
          item.isEditingText ? (
            <input
              ref={focusRef}
              defaultValue={item.text}
              onChange={(e) => onEditText(e.target.value)}
              onBlur={onBlur}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur() }}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'inherit', fontSize: 10.5, marginBottom: 6, border: 'none', outline: `2px solid ${accent}`, borderRadius: 4, padding: '1px 3px', width: '100%', background: '#fff', color: '#211D17' }}
            />
          ) : (
            <div onDoubleClick={onDblBodyText} style={{ fontSize: 10.5, color: item.descCol, marginBottom: 6, lineHeight: 1.4, cursor: 'text' }}>{item.textDisplay}</div>
          )
        )}
        {item.showChips && (
          <div style={{ display: 'flex', gap: 5, margin: '5px 0 7px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, background: '#F0ECE3', color: '#211D17', borderRadius: 5, padding: '3px 6px' }}>Pay 4× ${(item.now / 4).toFixed(2)}</span>
            <span style={{ fontSize: 9.5, fontWeight: 700, background: '#F0ECE3', color: '#211D17', borderRadius: 5, padding: '3px 6px' }}>0% EMI</span>
          </div>
        )}
        {item.showPrice && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, justifyContent: item.justify, marginTop: 4 }}>
            {item.showDiscountRow && (
              item.isEditingWas ? (
                <input
                  ref={focusRef}
                  type="number"
                  step="0.01"
                  defaultValue={item.was}
                  onChange={(e) => onEditWas(parseFloat(e.target.value) || 0)}
                  onBlur={onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur() }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontFamily: 'inherit', fontSize: 11, width: 55, border: 'none', outline: `2px solid ${accent}`, borderRadius: 4, padding: '1px 3px', background: '#fff', color: '#211D17' }}
                />
              ) : (
                <span onDoubleClick={onDblWas} style={{ fontSize: 11, color: item.strikeCol, textDecoration: 'line-through', paddingBottom: 4, cursor: 'text' }}>{item.wasText}</span>
              )
            )}
            {item.pricePlaceholder && <div style={{ border: '1px dashed #CFC8BA', borderRadius: 7, padding: '3px 10px', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#B7AE9E', letterSpacing: '1px' }}>PRICE</div>}
            {!item.pricePlaceholder && (
              item.isEditingNow ? (
                <input
                  ref={focusRef}
                  type="number"
                  step="0.01"
                  defaultValue={item.now}
                  onChange={(e) => onEditNow(parseFloat(e.target.value) || 0)}
                  onBlur={onBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') (e.target as HTMLInputElement).blur() }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 'bold', width: 55, border: 'none', outline: `2px solid ${accent}`, borderRadius: 4, padding: '1px 3px', background: '#fff', color: '#211D17' }}
                />
              ) : (
                <div onDoubleClick={onDblNow} style={{ cursor: 'text' }}>
                  {item.usePill ? (
                    <div style={{ background: item.pillBg, color: item.pillText, borderRadius: 8, padding: '3px 9px 4px', display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, alignSelf: 'flex-start', marginTop: 2 }}>$</span>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceIntF, lineHeight: 0.9 }}>{item.nowInt}</span>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceCentF }}>{item.nowCents}</span>
                    </div>
                  ) : (
                    <div style={{ color: accent, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, alignSelf: 'flex-start', marginTop: 2 }}>$</span>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceIntF, lineHeight: 0.9 }}>{item.nowInt}</span>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: item.priceCentF }}>{item.nowCents}</span>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
