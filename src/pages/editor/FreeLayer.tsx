import { useRef, useState } from 'react'
import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import type { FreeElement } from '../../types'
import ContextMenu from './ContextMenu'

interface Props {
  pageKey: string
  pageW: number
  pageH: number
  accent: string
}

const HANDLES = [
  { dir: 'nw', xPct: 0,   yPct: 0,   cursor: 'nw-resize' },
  { dir: 'n',  xPct: 0.5, yPct: 0,   cursor: 'n-resize'  },
  { dir: 'ne', xPct: 1,   yPct: 0,   cursor: 'ne-resize' },
  { dir: 'e',  xPct: 1,   yPct: 0.5, cursor: 'e-resize'  },
  { dir: 'se', xPct: 1,   yPct: 1,   cursor: 'se-resize' },
  { dir: 's',  xPct: 0.5, yPct: 1,   cursor: 's-resize'  },
  { dir: 'sw', xPct: 0,   yPct: 1,   cursor: 'sw-resize' },
  { dir: 'w',  xPct: 0,   yPct: 0.5, cursor: 'w-resize'  },
]

type MoveState = {
  ids: string[]
  sx: number; sy: number
  initPos: Record<string, { x: number; y: number }>
}

type ResizeState = {
  el: FreeElement; dir: string
  sx: number; sy: number
  ox: number; oy: number; ow: number; oh: number
}

type CtxMenu = { x: number; y: number; el: FreeElement }

export default function FreeLayer({ pageKey, pageW, pageH, accent }: Props) {
  const {
    tool, pageElements, selectedFreeIds, freeElPageKey,
    set, addFreeEl, updateFreeEl, moveFreeEls, deleteFreeEls, duplicateFreeEl,
    groupFreeEls, ungroupFreeEls, setFreeElZIndex, toggleFreeElLock,
  } = useStore(useShallow((s) => ({
    tool: s.tool, pageElements: s.pageElements,
    selectedFreeIds: s.selectedFreeIds, freeElPageKey: s.freeElPageKey,
    set: s.set, addFreeEl: s.addFreeEl, updateFreeEl: s.updateFreeEl,
    moveFreeEls: s.moveFreeEls, deleteFreeEls: s.deleteFreeEls,
    duplicateFreeEl: s.duplicateFreeEl,
    groupFreeEls: s.groupFreeEls, ungroupFreeEls: s.ungroupFreeEls,
    setFreeElZIndex: s.setFreeElZIndex, toggleFreeElLock: s.toggleFreeElLock,
  })))

  const els = pageElements[pageKey] ?? []
  const selIds = freeElPageKey === pageKey ? selectedFreeIds : []
  const isDraw = tool === 'type' || tool === 'rect' || tool === 'ellipse' || tool === 'image'

  const containerRef = useRef<HTMLDivElement>(null)
  const [drawing, setDrawing] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const drawStart = useRef<{ x: number; y: number } | null>(null)
  const moveState = useRef<MoveState | null>(null)
  const resizeState = useRef<ResizeState | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [ctxMenu, setCtxMenu] = useState<CtxMenu | null>(null)

  const toRel = (pxVal: number, total: number) => (pxVal / total) * 100

  const getPos = (e: React.PointerEvent) => {
    const rect = containerRef.current!.getBoundingClientRect()
    return { x: toRel(e.clientX - rect.left, pageW), y: toRel(e.clientY - rect.top, pageH) }
  }

  // ── Drawing ──────────────────────────────────────────────────────────────────

  const onDrawDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const pos = getPos(e)
    drawStart.current = pos
    setDrawing({ x: pos.x, y: pos.y, w: 0, h: 0 })
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onDrawMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drawStart.current) return
    const pos = getPos(e)
    setDrawing({
      x: Math.min(drawStart.current.x, pos.x), y: Math.min(drawStart.current.y, pos.y),
      w: Math.abs(pos.x - drawStart.current.x), h: Math.abs(pos.y - drawStart.current.y),
    })
  }

  const onDrawUp = () => {
    const d = drawing; const start = drawStart.current
    drawStart.current = null; setDrawing(null)
    if (!start) return
    const type: FreeElement['type'] = tool === 'type' ? 'text' : tool === 'image' ? 'image' : tool === 'rect' ? 'rect' : 'ellipse'
    if (!d || d.w < 1 || d.h < 1) commitEl(start.x - 10, start.y - 5, 20, 12, type)
    else commitEl(d.x, d.y, d.w, d.h, type)
  }

  const commitEl = (x: number, y: number, w: number, h: number, type: FreeElement['type']) => {
    const el: FreeElement = {
      id: 'fe' + Date.now(), type,
      x: Math.max(0, Math.min(95, x)), y: Math.max(0, Math.min(95, y)),
      w: Math.max(4, Math.min(100, w)), h: Math.max(4, Math.min(100, h)),
      fill: type === 'rect' || type === 'ellipse' ? '#E4DFD5' : 'transparent',
      stroke: type === 'rect' || type === 'ellipse' ? '#211D17' : 'none',
      strokeW: 1, opacity: 1,
      text: type === 'text' ? 'Text' : '', fontSize: 18,
      bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover',
      zIndex: (pageElements[pageKey]?.length ?? 0) + 1, groupId: null,
    }
    addFreeEl(pageKey, el)
    set({ tool: 'select' })
  }

  // ── Selecting / Moving ───────────────────────────────────────────────────────

  const onElDown = (e: React.PointerEvent<HTMLDivElement>, el: FreeElement) => {
    if (tool !== 'select') return
    if (el.locked) return
    e.stopPropagation()

    // Determine new selection
    let newSelIds: string[]
    if (e.shiftKey) {
      if (selIds.includes(el.id)) {
        newSelIds = selIds.filter((id) => id !== el.id)
      } else {
        const groupMates = el.groupId ? els.filter((e2) => e2.groupId === el.groupId).map((e2) => e2.id) : [el.id]
        newSelIds = [...new Set([...selIds, ...groupMates])]
      }
    } else if (el.groupId && !selIds.includes(el.id)) {
      // Click on grouped element → select whole group
      newSelIds = els.filter((e2) => e2.groupId === el.groupId).map((e2) => e2.id)
    } else if (!selIds.includes(el.id)) {
      newSelIds = [el.id]
    } else {
      newSelIds = selIds
    }

    set({ selectedFreeIds: newSelIds, freeElPageKey: pageKey, selected: null })

    // Set up multi-move
    const pos = getPos(e)
    const initPos: Record<string, { x: number; y: number }> = {}
    newSelIds.forEach((id) => {
      const found = els.find((e2) => e2.id === id)
      if (found) initPos[id] = { x: found.x, y: found.y }
    })
    moveState.current = { ids: newSelIds, sx: pos.x, sy: pos.y, initPos }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onElMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!moveState.current) return
    const pos = getPos(e)
    const dx = pos.x - moveState.current.sx
    const dy = pos.y - moveState.current.sy
    const moves = moveState.current.ids.map((id) => {
      const init = moveState.current!.initPos[id]
      return { id, x: Math.max(0, Math.min(90, init.x + dx)), y: Math.max(0, Math.min(90, init.y + dy)) }
    })
    moveFreeEls(pageKey, moves)
  }

  const onElUp = () => { moveState.current = null }

  // ── Resize ───────────────────────────────────────────────────────────────────

  const onResizeDown = (e: React.PointerEvent<HTMLDivElement>, el: FreeElement, dir: string) => {
    e.stopPropagation()
    const pos = getPos(e)
    resizeState.current = { el, dir, sx: pos.x, sy: pos.y, ox: el.x, oy: el.y, ow: el.w, oh: el.h }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeState.current) return
    const { el, dir, sx, sy, ox, oy, ow, oh } = resizeState.current
    const pos = getPos(e)
    const dx = pos.x - sx; const dy = pos.y - sy
    let x = ox, y = oy, w = ow, h = oh
    if (dir.includes('e')) w = Math.max(4, ow + dx)
    if (dir.includes('s')) h = Math.max(4, oh + dy)
    if (dir.includes('w')) { w = Math.max(4, ow - dx); x = w === 4 ? ox + ow - 4 : ox + dx }
    if (dir.includes('n')) { h = Math.max(4, oh - dy); y = h === 4 ? oy + oh - 4 : oy + dy }
    updateFreeEl(pageKey, el.id, { x, y, w, h })
  }

  const onResizeUp = () => { resizeState.current = null }

  // ── Right-click context menu ─────────────────────────────────────────────────

  const onElContextMenu = (e: React.MouseEvent, el: FreeElement) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selIds.includes(el.id)) {
      set({ selectedFreeIds: [el.id], freeElPageKey: pageKey, selected: null })
    }
    setCtxMenu({ x: e.clientX, y: e.clientY, el })
  }

  const buildMenuItems = (el: FreeElement) => {
    const isGrouped = !!el.groupId
    const multiSel = selIds.length > 1
    const allSameGroup = selIds.every((id) => {
      const e2 = els.find((e) => e.id === id)
      return e2?.groupId && e2.groupId === el.groupId
    })

    return [
      { icon: '⧉', label: 'Duplicate', shortcut: '⌘D', onClick: () => duplicateFreeEl(pageKey, el.id) },
      { icon: '✕', label: 'Delete', shortcut: 'Del', danger: true, onClick: () => deleteFreeEls(pageKey, selIds.length > 0 ? selIds : [el.id]) },
      { separator: true },
      { icon: '⊞', label: 'Group', shortcut: '⌘G', disabled: !multiSel || allSameGroup, onClick: () => groupFreeEls(pageKey, selIds) },
      { icon: '⊟', label: 'Ungroup', shortcut: '⇧⌘G', disabled: !isGrouped, onClick: () => isGrouped && ungroupFreeEls(pageKey, el.groupId!) },
      { separator: true },
      { icon: '↑', label: 'Bring Forward', onClick: () => setFreeElZIndex(pageKey, el.id, 'forward') },
      { icon: '↓', label: 'Send Backward', onClick: () => setFreeElZIndex(pageKey, el.id, 'backward') },
      { icon: '⤒', label: 'Bring to Front', onClick: () => setFreeElZIndex(pageKey, el.id, 'front') },
      { icon: '⤓', label: 'Send to Back', onClick: () => setFreeElZIndex(pageKey, el.id, 'back') },
      { separator: true },
      { icon: el.locked ? '🔓' : '🔒', label: el.locked ? 'Unlock' : 'Lock', onClick: () => toggleFreeElLock(pageKey, el.id) },
    ]
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const stopClick = (e: React.MouseEvent) => e.stopPropagation()

  const elFont = (el: FreeElement, defaultFont: string) =>
    el.fontFamily ? `'${el.fontFamily}', ${defaultFont}` : defaultFont

  const elDir = (el: FreeElement): React.CSSProperties =>
    el.direction === 'rtl' ? { direction: 'rtl', textAlign: el.textAlign } : {}

  // ── Rendering ────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
      {els.map((el) => {
        const isSel = selIds.includes(el.id)
        const base: React.CSSProperties = {
          position: 'absolute',
          left: `${el.x}%`, top: `${el.y}%`,
          width: `${el.w}%`, height: `${el.h}%`,
          zIndex: el.zIndex,
          opacity: el.opacity,
          pointerEvents: tool === 'select' ? 'all' : 'none',
          cursor: el.locked ? 'not-allowed' : tool === 'select' ? 'move' : 'default',
          outline: isSel ? `2px solid ${accent}` : 'none',
          outlineOffset: '1px',
          boxSizing: 'border-box',
        }
        const handlers = {
          onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => onElDown(e, el),
          onPointerMove: onElMove,
          onPointerUp: onElUp,
          onClick: stopClick,
          onContextMenu: (e: React.MouseEvent<HTMLDivElement>) => onElContextMenu(e, el),
        }

        if (el.type === 'rect') return (
          <div key={el.id} style={{ ...base, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none' }} {...handlers} />
        )

        if (el.type === 'ellipse') return (
          <div key={el.id} style={{ ...base, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', borderRadius: '50%' }} {...handlers} />
        )

        if (el.type === 'image') return (
          <div key={el.id} style={{ ...base, background: '#F0ECE3', border: '1px dashed #CFC8BA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }} {...handlers}>
            {el.imageUrl
              ? <img src={el.imageUrl} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: el.fit }} />
              : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#B7AE9E', letterSpacing: '0.5px', textAlign: 'center', pointerEvents: 'none' }}>⊞<br />IMAGE</span>
            }
          </div>
        )

        if (el.type === 'brand-header') return (
          <div key={el.id} style={{ ...base, background: el.fill, display: 'flex', alignItems: 'center', padding: '0 5%', gap: '3%' }} {...handlers}>
            <div style={{ lineHeight: 1.1, pointerEvents: 'none', ...elDir(el) }}>
              <div style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: el.fontSize, color: el.fontColor, letterSpacing: '1px', lineHeight: 0.95 }}>{el.text || 'BRAND NAME'}</div>
              {el.text2 && <div style={{ fontFamily: elFont(el, "'Space Mono', monospace"), fontSize: Math.max(8, el.fontSize * 0.3), color: el.fontColor, opacity: 0.8, letterSpacing: '2px', marginTop: 3 }}>{el.text2}</div>}
            </div>
          </div>
        )

        if (el.type === 'promo-band') return (
          <div key={el.id} style={{ ...base, background: el.fill, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 4%', ...elDir(el) }} {...handlers}>
            <div style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: el.fontSize, color: el.fontColor, letterSpacing: '1px', transform: 'skewX(-5deg)', lineHeight: 0.9, pointerEvents: 'none' }}>{el.text || 'PROMO HEADLINE'}</div>
            {el.text2 && <div style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: Math.max(8, el.fontSize * 0.52), color: el.fontColor, letterSpacing: '2px', marginTop: '2%', opacity: 0.92, pointerEvents: 'none' }}>{el.text2}</div>}
            {el.text3 && <div style={{ fontFamily: elFont(el, "'Space Mono', monospace"), fontSize: Math.max(7, el.fontSize * 0.24), color: el.fontColor, letterSpacing: '3px', marginTop: '2%', opacity: 0.7, pointerEvents: 'none' }}>{el.text3}</div>}
          </div>
        )

        if (el.type === 'badge') return (
          <div key={el.id} style={{ ...base, background: el.fill, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1, boxShadow: '0 2px 10px rgba(33,29,23,.22)' }} {...handlers}>
            {el.text3 && <div style={{ fontSize: Math.max(7, el.fontSize * 0.22), fontWeight: 800, color: el.fontColor, fontFamily: elFont(el, "'Hanken Grotesk', sans-serif"), letterSpacing: '2px', pointerEvents: 'none' }}>{el.text3}</div>}
            <div style={{ display: 'flex', alignItems: 'flex-start', pointerEvents: 'none' }}>
              <span style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: el.fontSize, color: el.fontColor, lineHeight: 0.9 }}>{el.text || '50'}</span>
              <span style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: Math.max(8, el.fontSize * 0.42), color: el.fontColor, marginTop: '6%', lineHeight: 0.9 }}>{el.text2 || '%'}</span>
            </div>
            <div style={{ fontSize: Math.max(6, el.fontSize * 0.2), fontWeight: 700, color: el.fontColor, fontFamily: elFont(el, "'Hanken Grotesk', sans-serif"), letterSpacing: '2px', pointerEvents: 'none' }}>OFF</div>
          </div>
        )

        if (el.type === 'sticker') return (
          <div key={el.id} style={{ ...base, background: el.fill, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1, boxShadow: '0 2px 10px rgba(33,29,23,.22)', border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none' }} {...handlers}>
            <div style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: el.fontSize, color: el.fontColor, lineHeight: 0.95, pointerEvents: 'none' }}>{el.text || '800'}</div>
            {el.text2 && <div style={{ fontFamily: elFont(el, "'Hanken Grotesk', sans-serif"), fontSize: Math.max(7, el.fontSize * 0.28), fontWeight: 700, color: el.fontColor, letterSpacing: '2px', pointerEvents: 'none' }}>{el.text2}</div>}
          </div>
        )

        if (el.type === 'price-tag') return (
          <div key={el.id} style={{ ...base, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', borderRadius: 8, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 6%', ...elDir(el) }} {...handlers}>
            {el.text2 && <div style={{ fontFamily: elFont(el, "'Space Mono', monospace"), fontSize: Math.max(7, el.fontSize * 0.18), color: el.fontColor, opacity: 0.5, textDecoration: 'line-through', letterSpacing: '1px', pointerEvents: 'none' }}>{el.text2}</div>}
            <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 0.9, pointerEvents: 'none' }}>
              {el.text3 && <span style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: Math.max(8, el.fontSize * 0.3), color: el.fontColor, marginTop: '4%' }}>{el.text3}</span>}
              <span style={{ fontFamily: elFont(el, "'Anton', sans-serif"), fontSize: el.fontSize, color: el.fontColor, lineHeight: 0.9 }}>{el.text || '0.00'}</span>
            </div>
          </div>
        )

        // Text element
        const isEditing = editingId === el.id
        return (
          <div key={el.id}
            style={{ ...base, padding: '2px 4px', background: el.fill !== 'transparent' ? el.fill : 'none', border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', overflow: 'hidden', display: 'flex', alignItems: 'flex-start', ...elDir(el) }}
            onPointerDown={(e) => { if (!isEditing) onElDown(e, el) }}
            onPointerMove={onElMove}
            onPointerUp={onElUp}
            onClick={stopClick}
            onContextMenu={(e) => onElContextMenu(e, el)}
            onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id) }}
          >
            {isEditing ? (
              <textarea autoFocus defaultValue={el.text}
                onBlur={(e) => { updateFreeEl(pageKey, el.id, { text: e.target.value }); setEditingId(null) }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontFamily: elFont(el, "'Hanken Grotesk', sans-serif"), fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.fontColor, textAlign: el.textAlign, padding: 0, lineHeight: 1.4, cursor: 'text', pointerEvents: 'all', direction: el.direction ?? 'ltr' }}
              />
            ) : (
              <div style={{ fontFamily: elFont(el, "'Hanken Grotesk', sans-serif"), fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.fontColor, textAlign: el.textAlign, width: '100%', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word', pointerEvents: 'none', direction: el.direction ?? 'ltr' }}>
                {el.text || (isSel ? <span style={{ color: '#B7AE9E', fontStyle: 'italic', fontWeight: 400, fontSize: 11 }}>Double-click to edit</span> : null)}
              </div>
            )}
          </div>
        )
      })}

      {/* Resize handles for selected elements */}
      {tool === 'select' && els.filter((el) => selIds.includes(el.id) && !el.locked).map((el) =>
        HANDLES.map(({ dir, xPct, yPct, cursor }) => (
          <div key={`${el.id}-h-${dir}`}
            style={{
              position: 'absolute',
              left: `calc(${el.x + el.w * xPct}% - 5px)`,
              top: `calc(${el.y + el.h * yPct}% - 5px)`,
              width: 10, height: 10,
              background: '#fff', border: `2px solid ${accent}`,
              borderRadius: 2, cursor, zIndex: 200, pointerEvents: 'all',
              boxShadow: '0 1px 4px rgba(33,29,23,.25)',
            }}
            onPointerDown={(e) => onResizeDown(e, el, dir)}
            onPointerMove={onResizeMove}
            onPointerUp={onResizeUp}
            onClick={stopClick}
          />
        ))
      )}

      {/* Draw capture surface */}
      {isDraw && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'crosshair', pointerEvents: 'all' }}
          onPointerDown={onDrawDown} onPointerMove={onDrawMove} onPointerUp={onDrawUp} />
      )}

      {/* Drawing preview */}
      {drawing && drawing.w > 0.5 && drawing.h > 0.5 && (
        <div style={{
          position: 'absolute',
          left: `${drawing.x}%`, top: `${drawing.y}%`,
          width: `${drawing.w}%`, height: `${drawing.h}%`,
          border: `2px dashed ${accent}`, background: 'rgba(204,39,46,0.06)',
          borderRadius: tool === 'ellipse' ? '50%' : 0, zIndex: 51, pointerEvents: 'none',
        }} />
      )}

      {/* Right-click context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x} y={ctxMenu.y}
          items={buildMenuItems(ctxMenu.el)}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  )
}
