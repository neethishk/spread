import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent } from './helpers'
import type { FreeElement } from '../../types'

const TEXT_TYPES: FreeElement['type'][] = ['text', 'brand-header', 'promo-band', 'badge', 'sticker', 'price-tag']
const FILL_TYPES: FreeElement['type'][] = ['rect', 'ellipse', 'brand-header', 'promo-band', 'badge', 'sticker', 'price-tag']

export default function ContextBar() {
  const {
    selectedFreeIds, freeElPageKey, pageElements,
    accentKey, customAccent,
    updateFreeEl, deleteFreeEls, duplicateFreeEl,
  } = useStore(useShallow((s) => ({
    selectedFreeIds: s.selectedFreeIds,
    freeElPageKey: s.freeElPageKey,
    pageElements: s.pageElements,
    accentKey: s.accentKey,
    customAccent: s.customAccent,
    updateFreeEl: s.updateFreeEl,
    deleteFreeEls: s.deleteFreeEls,
    duplicateFreeEl: s.duplicateFreeEl,
  })))

  if (!freeElPageKey || selectedFreeIds.length === 0) return null

  const els = pageElements[freeElPageKey] ?? []
  const selEls = els.filter((e) => selectedFreeIds.includes(e.id))
  if (selEls.length === 0) return null

  const el = selEls[0]
  const isText = el.type === 'text'
  const hasText = TEXT_TYPES.includes(el.type)
  const hasFill = FILL_TYPES.includes(el.type)

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color

  const update = (patch: Partial<FreeElement>) => updateFreeEl(freeElPageKey, el.id, patch)

  const btnStyle = (active = false): React.CSSProperties => ({
    border: 'none',
    cursor: 'pointer',
    borderRadius: 7,
    padding: '4px 8px',
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 700,
    background: active ? '#F0ECE3' : 'transparent',
    color: active ? '#211D17' : '#6B645A',
    height: 28,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    whiteSpace: 'nowrap' as const,
  })

  const divider = (
    <div style={{ width: 1, height: 20, background: '#EAE6DD', flex: 'none', margin: '0 2px' }} />
  )

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 340,
      right: 312,
      height: 44,
      background: '#fff',
      borderBottom: '1px solid #EAE6DD',
      display: 'flex',
      alignItems: 'center',
      padding: '0 10px',
      gap: 2,
      zIndex: 50,
      boxShadow: '0 2px 6px rgba(33,29,23,.06)',
      overflow: 'hidden',
    }}>
      {/* Fill color */}
      {hasFill && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: '4px 6px', borderRadius: 7, ...btnStyle() }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: el.fill, border: '1.5px solid #CFC8BA', flex: 'none' }} />
          <span>Fill</span>
          <input
            type="color"
            value={el.fill.startsWith('#') ? el.fill : '#E4DFD5'}
            onChange={(e) => update({ fill: e.target.value })}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
        </label>
      )}

      {/* Text fill for text element */}
      {el.type === 'text' && el.fill !== 'transparent' && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', padding: '4px 6px', borderRadius: 7, ...btnStyle() }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: el.fill, border: '1.5px solid #CFC8BA', flex: 'none' }} />
          <span>Bg</span>
          <input
            type="color"
            value={el.fill.startsWith('#') ? el.fill : '#ffffff'}
            onChange={(e) => update({ fill: e.target.value })}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
        </label>
      )}

      {/* Font size */}
      {hasText && (
        <>
          {divider}
          <input
            type="number"
            value={el.fontSize}
            min={6}
            max={120}
            onChange={(e) => update({ fontSize: Math.max(6, Math.min(120, Number(e.target.value))) })}
            style={{
              width: 48,
              height: 28,
              border: '1px solid #E8E2D6',
              borderRadius: 7,
              textAlign: 'center',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 700,
              color: '#211D17',
              background: '#F8F6F2',
              outline: 'none',
              padding: 0,
            }}
          />
          <span style={{ fontSize: 10, color: '#9A9182', marginLeft: -1 }}>px</span>
        </>
      )}

      {/* Bold / Italic — text elements only */}
      {isText && (
        <>
          <button style={btnStyle(el.bold)} onClick={() => update({ bold: !el.bold })}>
            <span style={{ fontWeight: 900, fontSize: 13 }}>B</span>
          </button>
          <button style={btnStyle(el.italic)} onClick={() => update({ italic: !el.italic })}>
            <span style={{ fontStyle: 'italic', fontSize: 13 }}>I</span>
          </button>
        </>
      )}

      {/* Text color */}
      {hasText && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', ...btnStyle() }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: el.fontColor, border: '1.5px solid #CFC8BA', flex: 'none' }} />
          <span>Text</span>
          <input
            type="color"
            value={el.fontColor.startsWith('#') ? el.fontColor : '#211D17'}
            onChange={(e) => update({ fontColor: e.target.value })}
            style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }}
          />
        </label>
      )}

      {/* Text alignment — text elements only */}
      {isText && (
        <>
          {divider}
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              style={btnStyle(el.textAlign === a)}
              onClick={() => update({ textAlign: a })}
              title={`Align ${a}`}
            >
              {a === 'left' ? '⬛⬜⬜' : a === 'center' ? '⬜⬛⬜' : '⬜⬜⬛'}
            </button>
          ))}
        </>
      )}

      {divider}

      {/* Opacity */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px', cursor: 'pointer' }}>
        <span style={{ fontSize: 11, color: '#9A9182', fontFamily: "'Space Mono', monospace" }}>OPACITY</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={el.opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          style={{ width: 64, accentColor: accent, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 11, color: '#211D17', fontFamily: "'Space Mono', monospace", width: 28, textAlign: 'right' }}>
          {Math.round(el.opacity * 100)}%
        </span>
      </label>

      {divider}

      {/* Duplicate */}
      <button
        style={btnStyle()}
        onClick={() => duplicateFreeEl(freeElPageKey, el.id)}
        title="Duplicate (Ctrl+D)"
      >
        ⧉ Duplicate
      </button>

      {/* Delete */}
      <button
        style={{ ...btnStyle(), color: '#C0392B' }}
        onClick={() => deleteFreeEls(freeElPageKey, selectedFreeIds)}
        title="Delete (Del)"
      >
        ✕ Delete
      </button>
    </div>
  )
}
