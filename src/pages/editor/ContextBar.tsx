import { useStore } from '../../store'
import { useShallow } from 'zustand/react/shallow'
import { computeAccent } from './helpers'
import type { FreeElement } from '../../types'

const TEXT_TYPES: FreeElement['type'][] = ['text', 'brand-header', 'promo-band', 'badge', 'sticker', 'price-tag']
const FILL_TYPES: FreeElement['type'][] = ['rect', 'ellipse', 'brand-header', 'promo-band', 'badge', 'sticker', 'price-tag']
const STROKE_TYPES: FreeElement['type'][] = ['rect', 'ellipse', 'price-tag', 'sticker']

const FONTS = [
  { label: 'Default', value: '' },
  { label: 'Hanken Grotesk', value: 'Hanken Grotesk' },
  { label: 'Anton', value: 'Anton' },
  { label: 'Space Mono', value: 'Space Mono' },
  { label: 'Instrument Serif', value: 'Instrument Serif' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Cairo (Arabic)', value: 'Cairo' },
  { label: 'Noto Sans Arabic', value: 'Noto Sans Arabic' },
]

export default function ContextBar() {
  const {
    selectedFreeIds, freeElPageKey, pageElements,
    accentKey, customAccent,
    updateFreeEl, deleteFreeEls, duplicateFreeEl,
    groupFreeEls, ungroupFreeEls,
  } = useStore(useShallow((s) => ({
    selectedFreeIds: s.selectedFreeIds,
    freeElPageKey: s.freeElPageKey,
    pageElements: s.pageElements,
    accentKey: s.accentKey,
    customAccent: s.customAccent,
    updateFreeEl: s.updateFreeEl,
    deleteFreeEls: s.deleteFreeEls,
    duplicateFreeEl: s.duplicateFreeEl,
    groupFreeEls: s.groupFreeEls,
    ungroupFreeEls: s.ungroupFreeEls,
  })))

  if (!freeElPageKey || selectedFreeIds.length === 0) return null

  const els = pageElements[freeElPageKey] ?? []
  const selEls = els.filter((e) => selectedFreeIds.includes(e.id))
  if (selEls.length === 0) return null

  const el = selEls[0]
  const isText = el.type === 'text'
  const hasText = TEXT_TYPES.includes(el.type)
  const hasFill = FILL_TYPES.includes(el.type)
  const hasStroke = STROKE_TYPES.includes(el.type)
  const isMulti = selEls.length > 1
  const allSameGroup = selEls.every((e) => e.groupId && e.groupId === selEls[0].groupId)
  const hasGroup = selEls.some((e) => e.groupId)

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color

  const update = (patch: Partial<FreeElement>) => updateFreeEl(freeElPageKey, el.id, patch)

  const divider = <div style={{ width: 1, height: 20, background: '#EAE6DD', flex: 'none', margin: '0 2px' }} />

  const btn = (active = false, danger = false): React.CSSProperties => ({
    border: 'none', cursor: 'pointer', borderRadius: 7, padding: '4px 8px',
    fontFamily: 'inherit', fontSize: 12, fontWeight: 700, height: 28,
    display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap',
    background: active ? '#F0ECE3' : 'transparent',
    color: danger ? '#C0392B' : active ? '#211D17' : '#6B645A',
    flexShrink: 0,
  })

  const colorSwatch = (color: string, label: string, onChange: (v: string) => void) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', ...btn() }}>
      <div style={{ width: 13, height: 13, borderRadius: 3, background: color.startsWith('#') ? color : '#888', border: '1.5px solid #CFC8BA', flex: 'none' }} />
      <span>{label}</span>
      <input type="color" value={color.startsWith('#') ? color : '#888888'} onChange={(e) => onChange(e.target.value)}
        style={{ opacity: 0, position: 'absolute', width: 0, height: 0 }} />
    </label>
  )

  return (
    <div style={{
      position: 'absolute', top: 0, left: 288, right: 312, height: 44,
      background: '#fff', borderBottom: '1px solid #EAE6DD',
      display: 'flex', alignItems: 'center', padding: '0 8px', gap: 2,
      zIndex: 50, boxShadow: '0 2px 6px rgba(33,29,23,.06)', overflow: 'hidden',
    }}>

      {/* ── Fill ─────────────────── */}
      {hasFill && colorSwatch(el.fill, 'Fill', (v) => update({ fill: v }))}
      {isText && el.fill !== 'transparent' && colorSwatch(el.fill, 'Bg', (v) => update({ fill: v }))}

      {/* ── Border ─────────────────── */}
      {hasStroke && (
        <>
          {divider}
          {colorSwatch(el.stroke === 'none' ? '#211D17' : el.stroke, 'Border', (v) => update({ stroke: v }))}
          <input
            type="number" min={0} max={20} value={el.strokeW}
            onChange={(e) => update({ strokeW: Math.max(0, Number(e.target.value)), stroke: el.stroke === 'none' ? '#211D17' : el.stroke })}
            style={{ width: 38, height: 26, border: '1px solid #E8E2D6', borderRadius: 6, textAlign: 'center', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: '#211D17', background: '#F8F6F2', outline: 'none', padding: 0 }}
          />
          <span style={{ fontSize: 10, color: '#9A9182' }}>px</span>
          <button style={btn(el.stroke === 'none')} onClick={() => update({ stroke: el.stroke === 'none' ? '#211D17' : 'none' })}>
            {el.stroke === 'none' ? 'Off' : 'On'}
          </button>
        </>
      )}

      {/* ── Font family ─────────────────── */}
      {hasText && (
        <>
          {divider}
          <select
            value={el.fontFamily ?? ''}
            onChange={(e) => {
              const ff = e.target.value
              update({ fontFamily: ff, direction: (ff === 'Cairo' || ff === 'Noto Sans Arabic') ? 'rtl' : el.direction })
            }}
            style={{ height: 28, border: '1px solid #E8E2D6', borderRadius: 7, fontFamily: 'inherit', fontSize: 11, color: '#211D17', background: '#F8F6F2', outline: 'none', padding: '0 4px', cursor: 'pointer', maxWidth: 130 }}
          >
            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </>
      )}

      {/* ── Font size ─────────────────── */}
      {hasText && (
        <>
          <input type="number" min={6} max={120} value={el.fontSize}
            onChange={(e) => update({ fontSize: Math.max(6, Math.min(120, Number(e.target.value))) })}
            style={{ width: 44, height: 26, border: '1px solid #E8E2D6', borderRadius: 6, textAlign: 'center', fontFamily: 'inherit', fontSize: 11, fontWeight: 700, color: '#211D17', background: '#F8F6F2', outline: 'none', padding: 0 }}
          />
          <span style={{ fontSize: 10, color: '#9A9182', marginLeft: -2 }}>px</span>
        </>
      )}

      {/* ── Bold / Italic ─────────────────── */}
      {isText && (
        <>
          <button style={btn(el.bold)} onClick={() => update({ bold: !el.bold })}><b>B</b></button>
          <button style={btn(el.italic)} onClick={() => update({ italic: !el.italic })}><i>I</i></button>
        </>
      )}

      {/* ── Text color ─────────────────── */}
      {hasText && colorSwatch(el.fontColor, 'A', (v) => update({ fontColor: v }))}

      {/* ── Alignment (text only) ─────────────────── */}
      {isText && (
        <>
          {divider}
          {(['left','center','right'] as const).map((a) => (
            <button key={a} style={btn(el.textAlign === a)} onClick={() => update({ textAlign: a })} title={`Align ${a}`}>
              {a === 'left' ? '⬤◯◯' : a === 'center' ? '◯⬤◯' : '◯◯⬤'}
            </button>
          ))}
        </>
      )}

      {/* ── RTL toggle ─────────────────── */}
      {hasText && (
        <>
          {divider}
          <button style={btn(el.direction === 'rtl')} onClick={() => update({ direction: el.direction === 'rtl' ? 'ltr' : 'rtl' })} title="Toggle RTL / Arabic text direction">
            RTL
          </button>
        </>
      )}

      {/* ── Opacity ─────────────────── */}
      {divider}
      <label style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '0 2px', cursor: 'pointer', flexShrink: 0 }}>
        <span style={{ fontSize: 10, color: '#9A9182', fontFamily: "'Space Mono', monospace" }}>OPACITY</span>
        <input type="range" min={0} max={1} step={0.01} value={el.opacity}
          onChange={(e) => update({ opacity: Number(e.target.value) })}
          style={{ width: 58, accentColor: accent, cursor: 'pointer' }}
        />
        <span style={{ fontSize: 10, color: '#211D17', fontFamily: "'Space Mono', monospace", width: 26, textAlign: 'right' }}>
          {Math.round(el.opacity * 100)}%
        </span>
      </label>

      {divider}

      {/* ── Group / Ungroup ─────────────────── */}
      {isMulti && !allSameGroup && (
        <button style={btn()} onClick={() => groupFreeEls(freeElPageKey, selectedFreeIds)} title="Group elements (Ctrl+G)">
          ⧉ Group
        </button>
      )}
      {hasGroup && (
        <button style={btn()} onClick={() => { if (el.groupId) ungroupFreeEls(freeElPageKey, el.groupId) }} title="Ungroup">
          ⊞ Ungroup
        </button>
      )}

      {/* ── Duplicate ─────────────────── */}
      <button style={btn()} onClick={() => duplicateFreeEl(freeElPageKey, el.id)} title="Duplicate (Ctrl+D)">
        ⧉ Dupe
      </button>

      {/* ── Delete ─────────────────── */}
      <button style={btn(false, true)} onClick={() => deleteFreeEls(freeElPageKey, selectedFreeIds)} title="Delete (Del)">
        ✕
      </button>
    </div>
  )
}
