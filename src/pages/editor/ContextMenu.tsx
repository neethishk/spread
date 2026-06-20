import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface ContextMenuAction {
  label?: string
  icon?: string
  shortcut?: string
  danger?: boolean
  disabled?: boolean
  separator?: boolean
  onClick?: () => void
  submenu?: ContextMenuAction[]
}

interface Props {
  x: number
  y: number
  items: ContextMenuAction[]
  onClose: () => void
}

export default function ContextMenu({ x, y, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('mousedown', onDown, true)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown, true)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  // Keep menu within viewport
  const menuW = 220
  const vx = Math.min(x, window.innerWidth - menuW - 8)
  const vy = y

  const menuStyle: React.CSSProperties = {
    position: 'fixed', top: vy, left: vx, width: menuW,
    background: '#fff', borderRadius: 12,
    boxShadow: '0 8px 32px rgba(33,29,23,.18), 0 1px 4px rgba(33,29,23,.08)',
    border: '1px solid #E8E2D6', zIndex: 9999,
    padding: '5px 0', overflow: 'hidden',
    fontFamily: "'Hanken Grotesk', sans-serif",
  }

  return createPortal(
    <div ref={ref} style={menuStyle} onContextMenu={(e) => e.preventDefault()}>
      {items.map((item, i) => {
        if (item.separator) {
          return <div key={i} style={{ height: 1, background: '#EAE6DD', margin: '4px 0' }} />
        }
        return (
          <button
            key={i}
            disabled={item.disabled}
            onClick={() => { item.onClick?.(); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', border: 'none', background: 'none',
              padding: '7px 14px', cursor: item.disabled ? 'default' : 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
              color: item.disabled ? '#C2BBA8' : item.danger ? '#C0392B' : '#211D17',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) (e.currentTarget as HTMLButtonElement).style.background = '#F8F6F2'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none'
            }}
          >
            {item.icon && <span style={{ fontSize: 14, width: 18, textAlign: 'center', flex: 'none' }}>{item.icon}</span>}
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.shortcut && (
              <span style={{ fontSize: 11, color: '#B7AE9E', fontFamily: "'Space Mono', monospace", flex: 'none' }}>
                {item.shortcut}
              </span>
            )}
          </button>
        )
      })}
    </div>,
    document.body
  )
}
