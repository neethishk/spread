import { useStore } from '../../store'
import { computeAccent, computePageDimensions, gridTokens } from './helpers'

export default function LeftPanel() {
  const {
    leftTab, products, manualPages, gridKey, pageSize, orientation, template,
    selected, dragId, pageDragId, banners,
    accentKey, customAccent,
    set, addDeal, addBlank, addBlankPage, removeManualPage, reorder, reorderManualPages,
  } = useStore((s) => ({
    leftTab: s.leftTab, products: s.products, manualPages: s.manualPages,
    gridKey: s.gridKey, pageSize: s.pageSize,
    orientation: s.orientation, template: s.template,
    selected: s.selected, dragId: s.dragId, pageDragId: s.pageDragId,
    banners: s.banners,
    accentKey: s.accentKey, customAccent: s.customAccent,
    set: s.set, addDeal: s.addDeal, addBlank: s.addBlank, addBlankPage: s.addBlankPage,
    removeManualPage: s.removeManualPage, reorder: s.reorder, reorderManualPages: s.reorderManualPages,
  }))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageH } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)

  // Build pages list for pageNav
  const ban = banners[template] ?? { title: 'DEALS', sub: '' }
  let contentPageCount = 0
  let gi = 0
  while (gi < products.length) { gi += gtk.perPage; contentPageCount++ }
  if (contentPageCount === 0) contentPageCount = 1
  const totalPages = contentPageCount + 1 + manualPages.length

  const jumpTo = (id: string) => {
    const canvas = document.getElementById('sp-canvas')
    const el = document.getElementById(id)
    if (canvas && el) canvas.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
  }

  const segOn = { bg: '#fff', fg: '#211D17' }
  const segOff = { bg: 'transparent', fg: '#9A9182' }

  return (
    <div style={{ width: 288, flex: 'none', borderRight: '1px solid #EAE6DD', background: '#FBF9F4', display: 'flex', flexDirection: 'column' }}>
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, padding: '12px 12px 0' }}>
        <button
          onClick={() => set({ leftTab: 'deals' })}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: 9, borderRadius: '9px 9px 0 0', background: leftTab === 'deals' ? segOn.bg : segOff.bg, color: leftTab === 'deals' ? segOn.fg : segOff.fg }}
        >
          Deals
        </button>
        <button
          onClick={() => set({ leftTab: 'pages' })}
          style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: 9, borderRadius: '9px 9px 0 0', background: leftTab === 'pages' ? segOn.bg : segOff.bg, color: leftTab === 'pages' ? segOn.fg : segOff.fg }}
        >
          Pages
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
            DRAG BLANK PAGES TO REORDER · {totalPages} TOTAL
          </div>

          {/* Cover */}
          <PageNavItem
            id="sp-cover" label="Front Cover" pageNo="A" isCover isManual={false}
            draggable={false} dragOpacity={1} accent={accent}
            onJump={() => jumpTo('sp-cover')} onDelete={null}
          />

          {/* Content pages */}
          {Array.from({ length: contentPageCount }, (_, i) => (
            <PageNavItem
              key={i} id={`sp-pg-${i}`} label={ban.title} pageNo={String(i + 1)} isCover={false} isManual={false}
              draggable={false} dragOpacity={1} accent={accent}
              onJump={() => jumpTo(`sp-pg-${i}`)} onDelete={null}
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
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 8, borderRadius: 11, cursor: isManual ? 'grab' : 'pointer', background: '#fff', boxShadow: '0 0 0 1px #ECE8DF', marginBottom: 9, opacity: dragOpacity }}
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
      {isManual && onDelete && (
        <button onClick={onDelete} title="Delete page" style={{ border: 'none', background: '#F0ECE3', cursor: 'pointer', width: 24, height: 24, borderRadius: 7, color: '#9A9182', fontSize: 12, flex: 'none' }}>✕</button>
      )}
    </div>
  )
}
