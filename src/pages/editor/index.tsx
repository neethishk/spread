import { useEffect } from 'react'
import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent, computePageDimensions, gridTokens } from './helpers'
import { TOOL_DEFS, ZOOMS } from '../../constants'
import LeftPanel from './LeftPanel'
import Canvas from './Canvas'
import RightPanel from './RightPanel'
import ExportModal from './ExportModal'

export default function Editor() {
  const {
    tool, zoom, showRulers, showGuides, catalogName,
    products, manualPages, pageSize, orientation, gridKey, template,
    accentKey, customAccent, selected, history, future,
    set, zoomStep, undo, redo, goProjects,
    selectedFreeIds, freeElPageKey, deleteFreeEls,
  } = useStore(useShallow((s) => ({
    tool: s.tool, zoom: s.zoom, showRulers: s.showRulers, showGuides: s.showGuides,
    catalogName: s.catalogName, products: s.products, manualPages: s.manualPages,
    pageSize: s.pageSize, orientation: s.orientation,
    gridKey: s.gridKey, template: s.template, accentKey: s.accentKey,
    customAccent: s.customAccent, selected: s.selected, history: s.history, future: s.future,
    set: s.set, zoomStep: s.zoomStep, undo: s.undo, redo: s.redo, goProjects: s.goProjects,
    selectedFreeIds: s.selectedFreeIds, freeElPageKey: s.freeElPageKey, deleteFreeEls: s.deleteFreeEls,
  })))

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageH, sizeLabel } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)

  let contentPageCount = 0
  let gi = 0
  while (gi < products.length) { gi += gtk.perPage; contentPageCount++ }
  if (contentPageCount === 0) contentPageCount = 1
  const totalPages = contentPageCount + 1 + manualPages.length

  const orientLabel = orientation === 'landscape' ? 'Landscape' : 'Portrait'
  const gridLabel = gridKey.toUpperCase()
  const zoomPct = Math.round(zoom * 100) + '%'

  const selLabel = selected
    ? selected.type === 'product'
      ? 'Product selected'
      : selected.type === 'cover'
      ? 'Cover selected'
      : selected.type === 'banner'
      ? 'Banner selected'
      : 'Page selected'
    : ''

  const canUndo = history.length > 0
  const canRedo = future.length > 0

  const fitZoom = () => set({ zoom: 0.75 })
  const resetZoom = () => set({ zoom: 1 })

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { undo(); return }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { redo(); return }
        return
      }
      const toolMap: Record<string, string> = { v: 'select', t: 'type', f: 'image', m: 'rect', l: 'ellipse', h: 'hand', z: 'zoom' }
      if (toolMap[e.key.toLowerCase()]) { set({ tool: toolMap[e.key.toLowerCase()] }); return }
      if ((e.key === 'Delete' || e.key === 'Backspace') && freeElPageKey && selectedFreeIds.length > 0) {
        e.preventDefault()
        deleteFreeEls(freeElPageKey, selectedFreeIds)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [selectedFreeIds, freeElPageKey, undo, redo, set, deleteFreeEls])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', fontFamily: "'Hanken Grotesk', sans-serif", background: '#FBF9F4' }}>
      {/* Top bar */}
      <div style={{ height: 58, flex: 'none', borderBottom: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, background: '#fff', zIndex: 10 }}>
        {/* Left */}
        <button
          onClick={goProjects}
          title="Back to projects"
          style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 9, color: '#6B645A', fontFamily: 'inherit', fontSize: 13, fontWeight: 600 }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>←</span>
          Projects
        </button>

        <div style={{ width: 1, height: 20, background: '#EAE6DD', flex: 'none' }} />

        {/* Logo mark */}
        <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: '#fff', lineHeight: 1 }}>S</span>
        </div>

        <input
          value={catalogName}
          onChange={(e) => set({ catalogName: e.target.value })}
          style={{ border: 'none', background: 'none', outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 14, fontWeight: 600, color: '#211D17', minWidth: 0, flex: '1 1 auto', maxWidth: 340 }}
        />

        {/* Center stats */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 18 }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182', letterSpacing: '0.5px' }}>
            {totalPages} PAGES · {sizeLabel} · {orientLabel} · {gridLabel}
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            style={{ border: 'none', background: canUndo ? '#F0ECE3' : 'transparent', cursor: canUndo ? 'pointer' : 'default', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: canUndo ? '#211D17' : '#C2BBA8' }}
          >
            ↩
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            style={{ border: 'none', background: canRedo ? '#F0ECE3' : 'transparent', cursor: canRedo ? 'pointer' : 'default', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: canRedo ? '#211D17' : '#C2BBA8' }}
          >
            ↪
          </button>

          <div style={{ width: 1, height: 20, background: '#EAE6DD', flex: 'none' }} />

          <button
            onClick={() => set({ exportOpen: true, exportStage: 'config' })}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '9px 18px', borderRadius: 9, background: accent, color: '#fff' }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Tool rail */}
        <div style={{ width: 52, flex: 'none', background: '#211D17', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', gap: 4 }}>
          {TOOL_DEFS.map((td) => (
            <button
              key={td.k}
              onClick={() => set({ tool: td.k })}
              title={td.n}
              style={{
                width: 36, height: 36, borderRadius: 9, border: 'none', cursor: 'pointer',
                background: tool === td.k ? accent : 'transparent',
                color: tool === td.k ? '#fff' : '#9A9182',
                fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit',
              }}
            >
              {td.g}
            </button>
          ))}

          {/* Spacer + accent dot */}
          <div style={{ flex: 1 }} />
          <div
            style={{ width: 22, height: 22, borderRadius: '50%', background: accent, border: '2px solid rgba(255,255,255,.2)', cursor: 'pointer', marginBottom: 8 }}
            title="Accent color"
            onClick={() => set({ selected: null })}
          />
        </div>

        {/* Left panel */}
        <LeftPanel />

        {/* Canvas */}
        <Canvas />

        {/* Right panel */}
        <RightPanel />

        {/* Export modal overlay */}
        <ExportModal />
      </div>

      {/* Status bar */}
      <div style={{ height: 34, flex: 'none', borderTop: '1px solid #EAE6DD', background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 16 }}>
        {/* Left */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          {selLabel && (
            <>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#9A9182', letterSpacing: '0.4px' }}>{selLabel.toUpperCase()}</span>
              <span style={{ color: '#DDD8CE', fontSize: 12 }}>·</span>
            </>
          )}
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#B7AE9E', letterSpacing: '0.4px' }}>
            {totalPages} PAGES · {sizeLabel} · {orientLabel}
          </span>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, flex: 'none' }}>
          <StatusToggle label="RULERS" active={showRulers} onClick={() => set({ showRulers: !showRulers })} />
          <StatusToggle label="GUIDES" active={showGuides} onClick={() => set({ showGuides: !showGuides })} />

          <div style={{ width: 1, height: 16, background: '#EAE6DD', margin: '0 5px' }} />

          <button
            onClick={() => zoomStep(-1)}
            disabled={zoom <= ZOOMS[0]}
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B645A', fontWeight: 700 }}
          >
            −
          </button>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#211D17', minWidth: 36, textAlign: 'center' }}>{zoomPct}</span>
          <button
            onClick={() => zoomStep(1)}
            disabled={zoom >= ZOOMS[ZOOMS.length - 1]}
            style={{ border: 'none', background: 'none', cursor: 'pointer', width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B645A', fontWeight: 700 }}
          >
            +
          </button>

          <div style={{ width: 1, height: 16, background: '#EAE6DD', margin: '0 2px' }} />

          <button
            onClick={fitZoom}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6B645A', padding: '4px 7px', borderRadius: 6, letterSpacing: '0.3px' }}
          >
            FIT
          </button>
          <button
            onClick={resetZoom}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 10, color: '#6B645A', padding: '4px 7px', borderRadius: 6, letterSpacing: '0.3px' }}
          >
            100%
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusToggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none', cursor: 'pointer', fontFamily: "'Space Mono', monospace", fontSize: 10,
        padding: '4px 8px', borderRadius: 6, letterSpacing: '0.3px',
        background: active ? '#F0ECE3' : 'none',
        color: active ? '#211D17' : '#B7AE9E',
      }}
    >
      {label}
    </button>
  )
}
