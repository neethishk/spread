import { useRef, useState } from 'react'
import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import type { FreeElement } from '../../types'

interface Props {
  pageKey: string
  pageW: number
  pageH: number
  accent: string
}

export default function FreeLayer({ pageKey, pageW, pageH, accent }: Props) {
  const { tool, pageElements, selectedFreeIds, freeElPageKey, set, addFreeEl, updateFreeEl } = useStore(
    useShallow((s) => ({
      tool: s.tool,
      pageElements: s.pageElements,
      selectedFreeIds: s.selectedFreeIds,
      freeElPageKey: s.freeElPageKey,
      set: s.set,
      addFreeEl: s.addFreeEl,
      updateFreeEl: s.updateFreeEl,
    }))
  )

  const els = pageElements[pageKey] ?? []
  const selIds = freeElPageKey === pageKey ? selectedFreeIds : []
  const isDraw = tool === 'type' || tool === 'rect' || tool === 'ellipse' || tool === 'image'

  const containerRef = useRef<HTMLDivElement>(null)
  const [drawing, setDrawing] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const drawStart = useRef<{ x: number; y: number } | null>(null)
  const moveState = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

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
      x: Math.min(drawStart.current.x, pos.x),
      y: Math.min(drawStart.current.y, pos.y),
      w: Math.abs(pos.x - drawStart.current.x),
      h: Math.abs(pos.y - drawStart.current.y),
    })
  }

  const onDrawUp = () => {
    const d = drawing
    const start = drawStart.current
    drawStart.current = null
    setDrawing(null)
    if (!start) return
    const type: FreeElement['type'] = tool === 'type' ? 'text' : tool === 'image' ? 'image' : tool === 'rect' ? 'rect' : 'ellipse'
    if (!d || d.w < 1 || d.h < 1) {
      commitEl(start.x - 10, start.y - 5, 20, 12, type)
    } else {
      commitEl(d.x, d.y, d.w, d.h, type)
    }
  }

  const commitEl = (x: number, y: number, w: number, h: number, type: FreeElement['type']) => {
    const el: FreeElement = {
      id: 'fe' + Date.now(),
      type,
      x: Math.max(0, Math.min(95, x)),
      y: Math.max(0, Math.min(95, y)),
      w: Math.max(4, Math.min(100, w)),
      h: Math.max(4, Math.min(100, h)),
      fill: type === 'rect' || type === 'ellipse' ? '#E4DFD5' : 'transparent',
      stroke: type === 'rect' || type === 'ellipse' ? '#211D17' : 'none',
      strokeW: 1,
      opacity: 1,
      text: type === 'text' ? 'Text' : '',
      fontSize: 18,
      bold: false,
      italic: false,
      fontColor: '#211D17',
      textAlign: 'left',
      imageUrl: '',
      fit: 'cover',
      zIndex: (pageElements[pageKey]?.length ?? 0) + 1,
      groupId: null,
    }
    addFreeEl(pageKey, el)
    set({ tool: 'select' })
  }

  // ── Selecting / Moving ───────────────────────────────────────────────────────

  const onElDown = (e: React.PointerEvent<HTMLDivElement>, el: FreeElement) => {
    if (tool !== 'select') return
    e.stopPropagation()
    const pos = getPos(e)
    if (e.shiftKey) {
      const next = selIds.includes(el.id) ? selIds.filter((id) => id !== el.id) : [...selIds, el.id]
      set({ selectedFreeIds: next, freeElPageKey: pageKey, selected: null })
    } else {
      if (!selIds.includes(el.id)) set({ selectedFreeIds: [el.id], freeElPageKey: pageKey, selected: null })
    }
    moveState.current = { id: el.id, sx: pos.x, sy: pos.y, ox: el.x, oy: el.y }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onElMove = (e: React.PointerEvent<HTMLDivElement>, el: FreeElement) => {
    if (!moveState.current || moveState.current.id !== el.id) return
    const pos = getPos(e)
    const dx = pos.x - moveState.current.sx
    const dy = pos.y - moveState.current.sy
    updateFreeEl(pageKey, el.id, {
      x: Math.max(0, Math.min(90, moveState.current.ox + dx)),
      y: Math.max(0, Math.min(90, moveState.current.oy + dy)),
    })
  }

  const onElUp = () => { moveState.current = null }

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
          cursor: tool === 'select' ? 'move' : 'default',
          outline: isSel ? `2px solid ${accent}` : 'none',
          outlineOffset: '1px',
          boxSizing: 'border-box',
        }

        if (el.type === 'rect') {
          return (
            <div key={el.id} style={{ ...base, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none' }}
              onPointerDown={(e) => onElDown(e, el)} onPointerMove={(e) => onElMove(e, el)} onPointerUp={onElUp} />
          )
        }

        if (el.type === 'ellipse') {
          return (
            <div key={el.id} style={{ ...base, background: el.fill, border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', borderRadius: '50%' }}
              onPointerDown={(e) => onElDown(e, el)} onPointerMove={(e) => onElMove(e, el)} onPointerUp={onElUp} />
          )
        }

        if (el.type === 'image') {
          return (
            <div key={el.id}
              style={{ ...base, background: '#F0ECE3', border: '1px dashed #CFC8BA', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onPointerDown={(e) => onElDown(e, el)} onPointerMove={(e) => onElMove(e, el)} onPointerUp={onElUp}
            >
              {el.imageUrl
                ? <img src={el.imageUrl} alt="" crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: el.fit }} />
                : <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: '#B7AE9E', letterSpacing: '0.5px', textAlign: 'center', pointerEvents: 'none' }}>⊞<br />IMAGE</span>
              }
            </div>
          )
        }

        // text
        const isEditing = editingId === el.id
        return (
          <div key={el.id}
            style={{ ...base, padding: '2px 4px', background: el.fill !== 'transparent' ? el.fill : 'none', border: el.stroke !== 'none' ? `${el.strokeW}px solid ${el.stroke}` : 'none', overflow: 'hidden', display: 'flex', alignItems: 'flex-start' }}
            onPointerDown={(e) => { if (!isEditing) onElDown(e, el) }}
            onPointerMove={(e) => { if (!isEditing) onElMove(e, el) }}
            onPointerUp={onElUp}
            onDoubleClick={(e) => { e.stopPropagation(); setEditingId(el.id) }}
          >
            {isEditing ? (
              <textarea
                autoFocus
                defaultValue={el.text}
                onBlur={(e) => { updateFreeEl(pageKey, el.id, { text: e.target.value }); setEditingId(null) }}
                onClick={(e) => e.stopPropagation()}
                style={{ width: '100%', height: '100%', border: 'none', background: 'transparent', resize: 'none', outline: 'none', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.fontColor, textAlign: el.textAlign, padding: 0, lineHeight: 1.4, cursor: 'text', pointerEvents: 'all' }}
              />
            ) : (
              <div style={{ fontSize: el.fontSize, fontWeight: el.bold ? 700 : 400, fontStyle: el.italic ? 'italic' : 'normal', color: el.fontColor, textAlign: el.textAlign, width: '100%', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordBreak: 'break-word', pointerEvents: 'none' }}>
                {el.text || (isSel ? <span style={{ color: '#B7AE9E', fontStyle: 'italic', fontWeight: 400, fontSize: 11 }}>Double-click to edit</span> : null)}
              </div>
            )}
          </div>
        )
      })}

      {/* Draw capture surface */}
      {isDraw && (
        <div
          style={{ position: 'absolute', inset: 0, zIndex: 50, cursor: 'crosshair', pointerEvents: 'all' }}
          onPointerDown={onDrawDown}
          onPointerMove={onDrawMove}
          onPointerUp={onDrawUp}
        />
      )}

      {/* Drawing preview */}
      {drawing && drawing.w > 0.5 && drawing.h > 0.5 && (
        <div style={{
          position: 'absolute',
          left: `${drawing.x}%`, top: `${drawing.y}%`,
          width: `${drawing.w}%`, height: `${drawing.h}%`,
          border: `2px dashed ${accent}`,
          background: 'rgba(204,39,46,0.06)',
          borderRadius: tool === 'ellipse' ? '50%' : 0,
          zIndex: 51, pointerEvents: 'none',
        }} />
      )}
    </div>
  )
}
