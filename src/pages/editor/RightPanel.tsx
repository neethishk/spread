import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent, computePageDimensions, gridTokens, ring, swX } from './helpers'
import { ACCENTS, PALETTES, TPL_DEFS, GRIDS, SIZES, TAGCOL } from '../../constants'
import type { GridKey, FreeElement } from '../../types'

export default function RightPanel() {
  const {
    selected, template, gridKey, pageSize, orientation,
    accentKey, customAccent, badge, products, manualPages, banners, cover,
    pageElements, selectedFreeIds, freeElPageKey, pageGrids,
    set, updateProduct, updateOv, duplicateProduct, removeProduct, moveProduct,
    updateFreeEl, deleteFreeEls, groupFreeEls, ungroupFreeEls,
    setPageGrid, setManualGrid,
  } = useStore(useShallow((s) => ({
    selected: s.selected, template: s.template, gridKey: s.gridKey,
    pageSize: s.pageSize, orientation: s.orientation,
    accentKey: s.accentKey, customAccent: s.customAccent, badge: s.badge,
    products: s.products, manualPages: s.manualPages, banners: s.banners, cover: s.cover,
    pageElements: s.pageElements, selectedFreeIds: s.selectedFreeIds, freeElPageKey: s.freeElPageKey,
    pageGrids: s.pageGrids,
    set: s.set, updateProduct: s.updateProduct, updateOv: s.updateOv,
    duplicateProduct: s.duplicateProduct, removeProduct: s.removeProduct, moveProduct: s.moveProduct,
    updateFreeEl: s.updateFreeEl, deleteFreeEls: s.deleteFreeEls,
    groupFreeEls: s.groupFreeEls, ungroupFreeEls: s.ungroupFreeEls,
    setPageGrid: s.setPageGrid, setManualGrid: s.setManualGrid,
  })))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageH } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)

  // Find selected product
  let selProduct = null
  if (selected?.type === 'product') {
    selProduct = products.find((p) => p.id === selected.id) ?? null
    if (!selProduct) {
      for (const mp of manualPages) {
        selProduct = (mp.items ?? []).find((p) => p.id === selected.id) ?? null
        if (selProduct) break
      }
    }
  }

  const selectedFreeEl: FreeElement | null = selectedFreeIds.length > 0 && freeElPageKey
    ? (pageElements[freeElPageKey] ?? []).find((e) => e.id === selectedFreeIds[0]) ?? null
    : null

  const inspMode = selectedFreeEl ? 'freeEl' : !selected ? 'none' : (selProduct ? 'product' : selected.type)
  const ban = banners[template] ?? { title: '', sub: '' }
  const segOn = { bg: '#fff', fg: '#211D17' }
  const segOff = { bg: 'transparent', fg: '#9A9182' }
  const seg = (active: boolean) => active ? segOn : segOff

  return (
    <div className="sp-scroll" style={{ width: 312, flex: 'none', borderLeft: '1px solid #EAE6DD', background: '#FBF9F4', overflow: 'auto' }}>

      {/* ===== DESIGN PANEL (no selection) ===== */}
      {inspMode === 'none' && (
        <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 26 }}>

          {/* Template */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 14 }}>TEMPLATE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TPL_DEFS.map((t) => (
                <div
                  key={t.key}
                  onClick={() => set({ template: t.key })}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 11, borderRadius: 12, cursor: 'pointer', background: '#fff', boxShadow: ring(t.key === template, accent) }}
                >
                  <div style={{ width: 34, height: 42, borderRadius: 5, flex: 'none', background: '#F0ECE3', position: 'relative', overflow: 'hidden', border: '1px solid #E8E2D6' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: accent }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5 }}>{t.name}</div>
                    <div style={{ fontSize: 11.5, color: '#9A9182' }}>{t.desc}</div>
                  </div>
                  <span style={{ fontSize: 15, color: t.key === template ? accent : 'transparent' }}>✓</span>
                </div>
              ))}
            </div>
          </div>

          {/* Default Grid */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 5 }}>DEFAULT GRID</div>
            <div style={{ fontSize: 11, color: '#B7AE9E', marginBottom: 11, lineHeight: 1.4 }}>New pages use this. Change any single page from the bar at the top of that page.</div>
            <div style={{ display: 'flex', gap: 9 }}>
              {Object.keys(GRIDS).map((k) => {
                const g = GRIDS[k as GridKey]
                const active = k === gridKey
                return (
                  <div
                    key={k}
                    onClick={() => set({ gridKey: k as GridKey })}
                    title={k}
                    style={{ flex: 1, cursor: 'pointer', background: '#fff', borderRadius: 9, padding: '8px 6px 6px', boxShadow: ring(active, accent), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${g.cols}, 1fr)`, gap: 2, width: 22 }}>
                      {Array.from({ length: g.cols * g.rows }).map((_, i) => (
                        <div key={i} style={{ aspectRatio: '1', background: active ? accent : '#D5CEC1', borderRadius: 1 }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? '#211D17' : '#9A9182' }}>{k.replace('x', '×')}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Page Size */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>PAGE SIZE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {Object.keys(SIZES).map((k) => (
                <div
                  key={k}
                  onClick={() => set({ pageSize: k as any })}
                  style={{ cursor: 'pointer', fontSize: 12.5, fontWeight: 600, padding: '8px 14px', borderRadius: 9, background: '#fff', boxShadow: ring(k === pageSize, accent) }}
                >
                  {SIZES[k as keyof typeof SIZES].label}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3 }}>
              <button onClick={() => set({ orientation: 'portrait' })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(orientation === 'portrait') }}>Portrait</button>
              <button onClick={() => set({ orientation: 'landscape' })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(orientation === 'landscape') }}>Landscape</button>
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 6 }}>COLOR PALETTE</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0 16px' }}>
              {PALETTES.map((pl) => {
                const active = accentKey === 'custom' && customAccent === pl.accent && badge === pl.badge
                return (
                  <div
                    key={pl.key}
                    onClick={() => set({ accentKey: 'custom', customAccent: pl.accent, badge: pl.badge })}
                    style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '9px 11px', borderRadius: 11, cursor: 'pointer', background: '#fff', boxShadow: ring(active, accent) }}
                  >
                    <div style={{ display: 'flex', gap: 5, flex: 'none' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: pl.accent }} />
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: pl.badge }} />
                    </div>
                    <div style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{pl.name}</div>
                    <span style={{ fontSize: 14, color: active ? accent : 'transparent' }}>✓</span>
                  </div>
                )
              })}
            </div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '1px', color: '#B7AE9E', marginBottom: 10 }}>ACCENT SWATCHES</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 10 }}>
              {Object.keys(ACCENTS).map((k) => (
                <div
                  key={k}
                  onClick={() => set({ accentKey: k })}
                  title={ACCENTS[k].name}
                  style={{ aspectRatio: '1', borderRadius: '50%', cursor: 'pointer', background: ACCENTS[k].color, boxShadow: k === accentKey ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${ACCENTS[k].color}` : '0 0 0 1px #E4DFD5' }}
                />
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 11, padding: '10px 12px', boxShadow: accentKey === 'custom' ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${customAccent}` : '0 0 0 1px #E4DFD5' }}>
              <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                <span style={{ position: 'absolute', inset: 0, background: customAccent }} />
                <input
                  type="color" value={customAccent}
                  onChange={(e) => set({ accentKey: 'custom', customAccent: e.target.value })}
                  style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                />
              </label>
              <div onClick={() => set({ accentKey: 'custom' })} style={{ flex: 1, cursor: 'pointer' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Custom accent</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{customAccent}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 11, padding: '10px 12px', boxShadow: '0 0 0 1px #E4DFD5' }}>
              <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                <span style={{ position: 'absolute', inset: 0, background: badge }} />
                <input
                  type="color" value={badge}
                  onChange={(e) => set({ badge: e.target.value })}
                  style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}
                />
              </label>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Badge &amp; burst color</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{badge}</div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#6B645A' }}>{ac.name}</div>
          </div>

          {/* Smart layout info */}
          <div style={{ background: ac.soft, borderRadius: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 5 }}>Smart layout is on</div>
            <div style={{ fontSize: 12.5, color: '#6B645A', lineHeight: 1.45 }}>
              Spread auto-paginates your deals across pages and recalculates savings live.
            </div>
          </div>
        </div>
      )}

      {/* ===== PRODUCT INSPECTOR ===== */}
      {inspMode === 'product' && selProduct && (() => {
        const sp = selProduct
        const id = sp.id
        const ov = sp.ov ?? {}
        const savePct = (sp.was > 0 && sp.now > 0) ? Math.round(((sp.was - sp.now) / sp.was) * 100) : 0
        const curAlign = ov.align ?? sp.align ?? 'left'
        const curBg = ov.bg ?? 'default'
        const curPad = ov.pad ?? 1
        const curWeight = ov.nameWeight ?? 700
        const posIdx = products.findIndex((p) => p.id === id)

        const fieldDefs = [
          { k: 'showImage', l: 'Image placeholder' }, { k: 'showTitle', l: 'Title' }, { k: 'showDesc', l: 'Description' },
          { k: 'showText', l: 'Body text' }, { k: 'showPrice', l: 'Price' }, { k: 'showDiscount', l: 'Discount / was price' }, { k: 'showBadge', l: 'Save amount badge' },
        ] as const
        const bgs = [
          { key: 'default', label: 'Default', sw: '#fff' }, { key: 'white', label: 'White', sw: '#fff' },
          { key: 'cream', label: 'Cream', sw: '#FBF6EC' }, { key: 'tint', label: 'Tint', sw: ac.soft }, { key: 'accent', label: 'Accent', sw: accent },
        ]

        return (
          <>
            <div style={{ position: 'sticky', top: 0, background: '#FBF9F4', zIndex: 2, padding: '18px 22px 14px', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => set({ selected: null })} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 15, color: '#211D17' }}>←</button>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{sp.blank ? 'Edit element' : 'Edit deal'}</div>
                <div style={{ fontSize: 11.5, color: '#9A9182', fontFamily: "'Space Mono', monospace" }}>{sp.category} · SAVE {savePct}%</div>
              </div>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Content */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>CONTENT</div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Product name</label>
                <input className="sp-in" value={sp.name} onChange={(e) => updateProduct(id, { name: e.target.value })} />
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', margin: '12px 0 6px' }}>Description</label>
                <input className="sp-in" value={sp.desc} onChange={(e) => updateProduct(id, { desc: e.target.value })} />
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', margin: '12px 0 6px' }}>Body text</label>
                <input className="sp-in" value={sp.text ?? ''} onChange={(e) => updateProduct(id, { text: e.target.value })} />
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Was price</label>
                    <input className="sp-in" type="number" value={sp.was} onChange={(e) => { const v = parseFloat(e.target.value); updateProduct(id, { was: isNaN(v) ? 0 : v }) }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: accent, display: 'block', marginBottom: 6 }}>Now price</label>
                    <input className="sp-in" type="number" value={sp.now} onChange={(e) => { const v = parseFloat(e.target.value); updateProduct(id, { now: isNaN(v) ? 0 : v }) }} />
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 11.5, color: '#9A9182' }}>Save badge auto-calculates to <b style={{ color: '#211D17' }}>{savePct}% off</b>.</div>
              </div>

              {/* Fields */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 6 }}>FIELDS</div>
                <div style={{ fontSize: 11.5, color: '#9A9182', marginBottom: 12, lineHeight: 1.45 }}>Show or hide each placeholder mapped from your CSV columns.</div>
                {fieldDefs.map((f) => {
                  const on = f.k === 'showText' ? !!sp.showText : sp[f.k] !== false
                  return (
                    <div key={f.k} onClick={() => updateProduct(id, { [f.k]: !on })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '9px 0', borderBottom: '1px solid #EFEADF' }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{f.l}</span>
                      <div style={{ width: 38, height: 22, borderRadius: 999, background: on ? accent : '#D5CEC1', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 2, left: swX(on), width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Layout */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>LAYOUT</div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Text alignment</label>
                <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3, marginBottom: 14 }}>
                  {(['left', 'center', 'right'] as const).map((a) => (
                    <button key={a} onClick={() => updateOv(id, { align: a })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(curAlign === a) }}>
                      {a[0].toUpperCase() + a.slice(1)}
                    </button>
                  ))}
                </div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Image position</label>
                <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3, marginBottom: 14 }}>
                  <button onClick={() => updateOv(id, { imgPos: 'top' })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(ov.imgPos !== 'left') }}>Image top</button>
                  <button onClick={() => updateOv(id, { imgPos: 'left' })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(ov.imgPos === 'left') }}>Image left</button>
                </div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Inner padding</label>
                <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3, marginBottom: 14 }}>
                  {([{ k: 0, l: 'XS' }, { k: 1, l: 'S' }, { k: 2, l: 'M' }, { k: 4, l: 'L' }] as const).map((p) => (
                    <button key={p.k} onClick={() => updateOv(id, { pad: p.k })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(curPad === p.k) }}>{p.l}</button>
                  ))}
                </div>
                <div onClick={() => updateOv(id, { span2: !ov.span2 })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Span 2 columns</span>
                  <div style={{ width: 38, height: 22, borderRadius: 999, background: ov.span2 ? accent : '#D5CEC1', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: swX(!!ov.span2), width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                  </div>
                </div>
              </div>

              {/* Type */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>TYPE</div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Name weight</label>
                <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3, marginBottom: 14 }}>
                  <button onClick={() => updateOv(id, { nameWeight: 400 })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(curWeight === 400) }}>Regular</button>
                  <button onClick={() => updateOv(id, { nameWeight: 600 })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(curWeight === 600) }}>Medium</button>
                  <button onClick={() => updateOv(id, { nameWeight: 800 })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(curWeight >= 700) }}>Bold</button>
                </div>
                <div onClick={() => updateOv(id, { upper: !ov.upper })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Uppercase name</span>
                  <div style={{ width: 38, height: 22, borderRadius: 999, background: ov.upper ? accent : '#D5CEC1', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: swX(!!ov.upper), width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>APPEARANCE</div>
                <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 8 }}>Cell background</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                  {bgs.map((b) => (
                    <div key={b.key} onClick={() => updateOv(id, { bg: b.key as any })} title={b.label} style={{ width: 32, height: 32, borderRadius: 8, cursor: 'pointer', background: b.sw, border: '1px solid #ECE8DF', boxShadow: curBg === b.key ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${accent}` : '0 0 0 1px #E4DFD5' }} />
                  ))}
                  <label title="Custom color" style={{ position: 'relative', width: 32, height: 32, flex: 'none', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', boxShadow: curBg === 'custom' ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${accent}` : '0 0 0 1px #E4DFD5' }}>
                    <span style={{ position: 'absolute', inset: 0, background: ov.customBg ?? '#ffffff' }} />
                    <input type="color" value={ov.customBg ?? '#ffffff'} onChange={(e) => updateOv(id, { bg: 'custom', customBg: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 50, height: 50, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A' }}>Corner radius</label>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{ov.radius ?? gtk.cellRadBase}px</span>
                </div>
                <input type="range" min="0" max="26" value={ov.radius ?? gtk.cellRadBase} onChange={(e) => updateOv(id, { radius: parseInt(e.target.value) })} style={{ width: '100%', accentColor: accent, marginBottom: 14 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A' }}>Opacity</label>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{Math.round((ov.opacity ?? 1) * 100)}%</span>
                </div>
                <input type="range" min="20" max="100" value={Math.round((ov.opacity ?? 1) * 100)} onChange={(e) => updateOv(id, { opacity: parseInt(e.target.value) / 100 })} style={{ width: '100%', accentColor: accent, marginBottom: 8 }} />
                <div onClick={() => updateOv(id, { shadow: !ov.shadow })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '10px 0' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Drop shadow</span>
                  <div style={{ width: 38, height: 22, borderRadius: 999, background: ov.shadow ? accent : '#D5CEC1', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: swX(!!ov.shadow), width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                  </div>
                </div>
              </div>

              {/* Border */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>BORDER</div>
                <div onClick={() => updateOv(id, { borderOn: !ov.borderOn })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '4px 0 12px' }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600 }}>Custom border</span>
                  <div style={{ width: 38, height: 22, borderRadius: 999, background: ov.borderOn ? accent : '#D5CEC1', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: swX(!!ov.borderOn), width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
                  </div>
                </div>
                {ov.borderOn && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A' }}>Width</label>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{ov.borderW ?? 2}px</span>
                    </div>
                    <input type="range" min="1" max="6" value={ov.borderW ?? 2} onChange={(e) => updateOv(id, { borderW: parseInt(e.target.value) })} style={{ width: '100%', accentColor: accent, marginBottom: 12 }} />
                    <div style={{ display: 'flex', gap: 9, alignItems: 'center' }}>
                      {[accent, '#211D17', '#B7AE9E'].map((col) => {
                        const cur = ov.borderColor ?? accent
                        return <div key={col} onClick={() => updateOv(id, { borderColor: col })} style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: col, boxShadow: cur === col ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${col}` : '0 0 0 1px #E4DFD5' }} />
                      })}
                      <label title="Custom color" style={{ position: 'relative', width: 30, height: 30, flex: 'none', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.12)' }}>
                        <span style={{ position: 'absolute', inset: 0, background: (ov.borderColor?.startsWith('#') ? ov.borderColor : '#888888'), borderRadius: '50%' }} />
                        <input type="color" value={ov.borderColor?.startsWith('#') ? ov.borderColor : '#888888'} onChange={(e) => updateOv(id, { borderColor: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 44, height: 44, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                      </label>
                    </div>
                  </>
                )}
              </div>

              {/* Flag */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>FLAG / RIBBON</div>
                <input
                  className="sp-in" placeholder="e.g. NEW, FREE gift, 800 pts"
                  value={sp.tag?.t ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    updateProduct(id, { tag: v ? { t: v, col: sp.tag?.col ?? 'green' } : null })
                  }}
                />
                <div style={{ display: 'flex', gap: 9, marginTop: 12, alignItems: 'center' }}>
                  {(['green', 'violet', 'blue'] as const).map((ck) => {
                    const col = TAGCOL[ck]
                    return (
                      <div
                        key={ck}
                        onClick={() => updateProduct(id, { tag: { t: sp.tag?.t ?? 'NEW', col: ck } })}
                        style={{ width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', background: col, boxShadow: sp.tag?.col === ck ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${col}` : '0 0 0 1px #E4DFD5' }}
                      />
                    )
                  })}
                  <label title="Custom color" style={{ position: 'relative', width: 30, height: 30, flex: 'none', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', boxShadow: sp.tag?.col === 'custom' ? `0 0 0 2px #FBF9F4, 0 0 0 4px ${sp.tag?.customCol ?? '#666'}` : '0 0 0 1px #E4DFD5' }}>
                    <span style={{ position: 'absolute', inset: 0, background: sp.tag?.customCol ?? '#666666', borderRadius: '50%' }} />
                    <input type="color" value={sp.tag?.customCol ?? '#666666'} onChange={(e) => updateProduct(id, { tag: { t: sp.tag?.t ?? 'NEW', col: 'custom', customCol: e.target.value } })} style={{ position: 'absolute', top: -6, left: -6, width: 44, height: 44, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                  </label>
                </div>
              </div>

              {/* Arrange */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>
                  ARRANGE · #{posIdx + 1} of {products.length}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => moveProduct(id, -1)} style={{ flex: 1, border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 9, borderRadius: 9 }}>↑ Move earlier</button>
                  <button onClick={() => moveProduct(id, 1)} style={{ flex: 1, border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 9, borderRadius: 9 }}>↓ Move later</button>
                </div>
              </div>

              <button onClick={() => updateOv(id, {})} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12.5, fontWeight: 600, padding: 10, borderRadius: 9, color: '#6B645A' }}>↺ Reset element styling</button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => duplicateProduct(id)} style={{ flex: 1, border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 10 }}>Duplicate</button>
                <button onClick={() => removeProduct(id)} style={{ flex: 1, border: '1px solid #FECACA', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 10, color: '#DC2626' }}>Delete</button>
              </div>
            </div>
          </>
        )
      })()}

      {/* ===== COVER INSPECTOR ===== */}
      {inspMode === 'cover' && (
        <>
          <div style={{ position: 'sticky', top: 0, background: '#FBF9F4', zIndex: 2, padding: '18px 22px 14px', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => set({ selected: null })} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 15, color: '#211D17' }}>←</button>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Edit cover</div>
          </div>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Store name</label><input className="sp-in" value={cover.brand} onChange={(e) => set({ cover: { ...cover, brand: e.target.value } })} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Headline line 1</label><input className="sp-in" value={cover.headline1} onChange={(e) => set({ cover: { ...cover, headline1: e.target.value } })} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Headline line 2</label><input className="sp-in" value={cover.headline2} onChange={(e) => set({ cover: { ...cover, headline2: e.target.value } })} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Savings burst</label><input className="sp-in" value={cover.burst} onChange={(e) => set({ cover: { ...cover, burst: e.target.value } })} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Validity dates</label><input className="sp-in" value={cover.validity} onChange={(e) => set({ cover: { ...cover, validity: e.target.value } })} /></div>
          </div>
        </>
      )}

      {/* ===== FREE ELEMENT INSPECTOR ===== */}
      {inspMode === 'freeEl' && selectedFreeEl && freeElPageKey && (() => {
        const fe = selectedFreeEl
        const pgKey = freeElPageKey
        const upd = (patch: Partial<FreeElement>) => updateFreeEl(pgKey, fe.id, patch)
        return (
          <>
            <div style={{ position: 'sticky', top: 0, background: '#FBF9F4', zIndex: 2, padding: '18px 22px 14px', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => set({ selectedFreeIds: [], freeElPageKey: null })} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 15, color: '#211D17' }}>←</button>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Edit element</div>
                <div style={{ fontSize: 11.5, color: '#9A9182', fontFamily: "'Space Mono', monospace", textTransform: 'uppercase' }}>{fe.type}</div>
              </div>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Position & Size */}
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>POSITION & SIZE</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['x', 'y', 'w', 'h'] as const).map((field) => (
                    <div key={field}>
                      <label style={{ fontSize: 10.5, fontWeight: 700, color: '#9A9182', display: 'block', marginBottom: 3, textTransform: 'uppercase' }}>{field} %</label>
                      <input type="number" className="sp-in" min={0} max={100} step={0.5}
                        value={Math.round((fe[field] as number) * 10) / 10}
                        onChange={(e) => upd({ [field]: parseFloat(e.target.value) || 0 })}
                        style={{ padding: '7px 9px', fontSize: 12 }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Compound element inspector (brand-header, promo-band, badge, sticker, price-tag) */}
              {(fe.type === 'brand-header' || fe.type === 'promo-band' || fe.type === 'badge' || fe.type === 'sticker' || fe.type === 'price-tag') && (
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>STYLE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Background</label>
                    <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                      <span style={{ position: 'absolute', inset: 0, background: fe.fill }} />
                      <input type="color" value={fe.fill === 'transparent' ? '#ffffff' : fe.fill} onChange={(e) => upd({ fill: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Text color</label>
                    <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                      <span style={{ position: 'absolute', inset: 0, background: fe.fontColor }} />
                      <input type="color" value={fe.fontColor} onChange={(e) => upd({ fontColor: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                    </label>
                  </div>

                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>CONTENT</div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>
                    {fe.type === 'badge' ? 'Number' : fe.type === 'price-tag' ? 'Price' : 'Main text'}
                  </label>
                  <input className="sp-in" value={fe.text} onChange={(e) => upd({ text: e.target.value })} />

                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', margin: '10px 0 6px' }}>
                    {fe.type === 'badge' ? 'Symbol' : fe.type === 'price-tag' ? 'Was price' : fe.type === 'sticker' ? 'Label' : 'Subtitle'}
                  </label>
                  <input className="sp-in" value={fe.text2 ?? ''} onChange={(e) => upd({ text2: e.target.value })} />

                  {(fe.type === 'promo-band' || fe.type === 'badge' || fe.type === 'brand-header' || fe.type === 'price-tag') && (
                    <>
                      <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', margin: '10px 0 6px' }}>
                        {fe.type === 'badge' ? 'Top label' : fe.type === 'price-tag' ? 'Currency' : fe.type === 'brand-header' ? 'Tagline' : 'Small print'}
                      </label>
                      <input className="sp-in" value={fe.text3 ?? ''} onChange={(e) => upd({ text3: e.target.value })} />
                    </>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Font size</label>
                    <input type="number" min={10} max={200} value={fe.fontSize} onChange={(e) => upd({ fontSize: parseInt(e.target.value) || 20 })} style={{ width: 64, padding: '7px 9px', border: '1px solid #E2DCD0', borderRadius: 9, fontFamily: 'inherit', fontSize: 12, color: '#211D17', outline: 'none' }} />
                  </div>
                </div>
              )}

              {/* Fill & Stroke */}
              {(fe.type === 'rect' || fe.type === 'ellipse') && (
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>FILL & STROKE</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Fill</label>
                    <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                      <span style={{ position: 'absolute', inset: 0, background: fe.fill === 'transparent' ? '#fff' : fe.fill }} />
                      <input type="color" value={fe.fill === 'transparent' ? '#ffffff' : fe.fill} onChange={(e) => upd({ fill: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                    </label>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Stroke</label>
                    <label style={{ position: 'relative', width: 34, height: 34, flex: 'none', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,.1)' }}>
                      <span style={{ position: 'absolute', inset: 0, background: fe.stroke === 'none' ? '#fff' : fe.stroke }} />
                      <input type="color" value={fe.stroke === 'none' ? '#211D17' : fe.stroke} onChange={(e) => upd({ stroke: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 48, height: 48, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                    </label>
                    <input type="number" min={0} max={12} value={fe.strokeW} onChange={(e) => upd({ strokeW: parseInt(e.target.value) || 0 })} style={{ width: 52, padding: '7px 9px', border: '1px solid #E2DCD0', borderRadius: 9, fontFamily: 'inherit', fontSize: 12, color: '#211D17', outline: 'none' }} />
                  </div>
                </div>
              )}

              {/* Image */}
              {fe.type === 'image' && (
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>IMAGE</div>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Image URL</label>
                  <input className="sp-in" placeholder="https://..." value={fe.imageUrl} onChange={(e) => upd({ imageUrl: e.target.value })} />
                  <div style={{ marginTop: 10 }}>
                    <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Fit</label>
                    <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3 }}>
                      {(['cover', 'contain', 'fill'] as const).map((f) => (
                        <button key={f} onClick={() => upd({ fit: f })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(fe.fit === f) }}>{f[0].toUpperCase() + f.slice(1)}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Text */}
              {fe.type === 'text' && (
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 10 }}>TEXT</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#6B645A', flex: 1 }}>Size</label>
                    <input type="number" min={6} max={200} value={fe.fontSize} onChange={(e) => upd({ fontSize: parseInt(e.target.value) || 16 })} style={{ width: 64, padding: '7px 9px', border: '1px solid #E2DCD0', borderRadius: 9, fontFamily: 'inherit', fontSize: 12, color: '#211D17', outline: 'none' }} />
                  </div>
                  <div style={{ display: 'flex', background: '#F0ECE3', borderRadius: 9, padding: 3, marginBottom: 10 }}>
                    {(['left', 'center', 'right'] as const).map((a) => (
                      <button key={a} onClick={() => upd({ textAlign: a })} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, padding: 7, borderRadius: 7, ...seg(fe.textAlign === a) }}>{a[0].toUpperCase() + a.slice(1)}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => upd({ bold: !fe.bold })} style={{ flex: 1, border: '1px solid #E0DACE', background: fe.bold ? '#211D17' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: 8, borderRadius: 9, color: fe.bold ? '#fff' : '#211D17' }}>B</button>
                    <button onClick={() => upd({ italic: !fe.italic })} style={{ flex: 1, border: '1px solid #E0DACE', background: fe.italic ? '#211D17' : '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 400, fontStyle: 'italic', padding: 8, borderRadius: 9, color: fe.italic ? '#fff' : '#211D17' }}>I</button>
                    <label style={{ flex: 1, position: 'relative', borderRadius: 9, overflow: 'hidden', cursor: 'pointer', border: '1px solid #E0DACE', display: 'flex', alignItems: 'center', justifyContent: 'center', background: fe.fontColor, minHeight: 36 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', mixBlendMode: 'difference', pointerEvents: 'none' }}>A</span>
                      <input type="color" value={fe.fontColor} onChange={(e) => upd({ fontColor: e.target.value })} style={{ position: 'absolute', top: -6, left: -6, width: 50, height: 50, border: 'none', padding: 0, cursor: 'pointer', opacity: 0 }} />
                    </label>
                  </div>
                </div>
              )}

              {/* Opacity */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A' }}>Opacity</label>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>{Math.round(fe.opacity * 100)}%</span>
                </div>
                <input type="range" min="5" max="100" value={Math.round(fe.opacity * 100)} onChange={(e) => upd({ opacity: parseInt(e.target.value) / 100 })} style={{ width: '100%', accentColor: accent }} />
              </div>

              {/* Group / Ungroup */}
              {selectedFreeIds.length > 1 && (
                <button onClick={() => groupFreeEls(pgKey, selectedFreeIds)} style={{ border: 'none', background: accent, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: 11, borderRadius: 10, color: '#fff' }}>
                  Group {selectedFreeIds.length} elements
                </button>
              )}
              {fe.groupId && (
                <button onClick={() => ungroupFreeEls(pgKey, fe.groupId!)} style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 10 }}>
                  Ungroup
                </button>
              )}

              <button onClick={() => deleteFreeEls(pgKey, selectedFreeIds)} style={{ border: '1px solid #FECACA', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: 11, borderRadius: 10, color: '#DC2626' }}>
                Delete element{selectedFreeIds.length > 1 ? 's' : ''}
              </button>
            </div>
          </>
        )
      })()}

      {/* ===== PAGE INSPECTOR ===== */}
      {inspMode === 'page' && selected && (() => {
        const isContent = selected.pIdx !== undefined
        const mp = selected.mpId ? manualPages.find((m) => m.id === selected.mpId) : null
        const curGKey = isContent
          ? ((pageGrids[selected.pIdx!] as GridKey) ?? gridKey)
          : ((mp?.gridKey as GridKey) ?? gridKey)
        return (
          <>
            <div style={{ position: 'sticky', top: 0, background: '#FBF9F4', zIndex: 2, padding: '18px 22px 14px', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => set({ selected: null })} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 15, color: '#211D17' }}>←</button>
              <div style={{ lineHeight: 1.1 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Page settings</div>
                <div style={{ fontSize: 11.5, color: '#9A9182', fontFamily: "'Space Mono', monospace" }}>
                  {isContent ? `CONTENT PAGE ${selected.pIdx! + 1}` : (mp?.title || 'CUSTOM PAGE').toUpperCase()}
                </div>
              </div>
            </div>
            <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 5 }}>GRID LAYOUT</div>
                <div style={{ fontSize: 11, color: '#B7AE9E', marginBottom: 11, lineHeight: 1.4 }}>Override the grid for this page only.</div>
                <div style={{ display: 'flex', gap: 9 }}>
                  {Object.keys(GRIDS).map((k) => {
                    const g = GRIDS[k as GridKey]
                    const active = k === curGKey
                    return (
                      <div
                        key={k}
                        onClick={() => isContent ? setPageGrid(selected.pIdx!, k as GridKey) : (mp && setManualGrid(mp.id, k as GridKey))}
                        title={k}
                        style={{ flex: 1, cursor: 'pointer', background: '#fff', borderRadius: 9, padding: '8px 6px 6px', boxShadow: ring(active, accent), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${g.cols}, 1fr)`, gap: 2, width: 22 }}>
                          {Array.from({ length: g.cols * g.rows }).map((_, i) => (
                            <div key={i} style={{ aspectRatio: '1', background: active ? accent : '#D5CEC1', borderRadius: 1 }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 9.5, fontWeight: 700, color: active ? '#211D17' : '#9A9182' }}>{k.replace('x', '×')}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
              {mp && (
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '1.5px', color: '#9A9182', marginBottom: 12 }}>PAGE TITLE</div>
                  <input
                    className="sp-in"
                    value={mp.title}
                    onChange={(e) => set({ manualPages: manualPages.map((m) => m.id === mp.id ? { ...m, title: e.target.value } : m) })}
                  />
                </div>
              )}
            </div>
          </>
        )
      })()}

      {/* ===== BANNER INSPECTOR ===== */}
      {inspMode === 'banner' && (
        <>
          <div style={{ position: 'sticky', top: 0, background: '#FBF9F4', zIndex: 2, padding: '18px 22px 14px', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => set({ selected: null })} style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, fontSize: 15, color: '#211D17' }}>←</button>
            <div style={{ fontWeight: 800, fontSize: 15 }}>Edit section banner</div>
          </div>
          <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Banner title</label><input className="sp-in" value={ban.title} onChange={(e) => set({ banners: { ...banners, [template]: { ...ban, title: e.target.value } } })} /></div>
            <div><label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Subtitle</label><input className="sp-in" value={ban.sub} onChange={(e) => set({ banners: { ...banners, [template]: { ...ban, sub: e.target.value } } })} /></div>
            <div style={{ fontSize: 12, color: '#9A9182', lineHeight: 1.45 }}>This banner repeats on every page of the <b style={{ color: '#211D17' }}>{TPL_DEFS.find((t) => t.key === template)?.name}</b> template.</div>
          </div>
        </>
      )}
    </div>
  )
}
