import { useStore } from '../store'

const accent = 'oklch(0.57 0.2 25)'

const PROC_TEXTS = [
  'Reading your file…',
  'Detecting products & prices…',
  'Calculating savings…',
  'Paginating pages…',
  'Adding finishing touches…',
]

function stripeBg() {
  return 'repeating-linear-gradient(135deg,#F3F1EC,#F3F1EC 11px,#EDEAE3 11px,#EDEAE3 22px)'
}

export default function Processing() {
  const { procStep, procCount } = useStore((s) => ({ procStep: s.procStep, procCount: s.procCount }))

  const procText = PROC_TEXTS[procStep] ?? PROC_TEXTS[0]
  const procPct = Math.round(((procStep + 1) / 5) * 100) + '%'
  const thumbs = Array.from({ length: procCount }, (_, i) => i)

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 30, padding: 24 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '3px', color: '#8A8276' }}>
          {procText.toUpperCase()}
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 48, margin: 0, letterSpacing: '-0.5px' }}>
          Building your booklet
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 66px)', gap: 11 }}>
          {thumbs.map((i) => (
            <div key={i} style={{ height: 82, borderRadius: 9, background: '#fff', border: '1px solid #ECE8DF', boxShadow: '0 3px 10px rgba(33,29,23,.07)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: stripeBg() }} />
              <div style={{ position: 'absolute', right: 5, bottom: 5, background: accent, color: '#fff', fontFamily: "'Anton', sans-serif", fontSize: 9, padding: '2px 5px', borderRadius: 4 }}>
                -{15 + i * 3}%
              </div>
            </div>
          ))}
        </div>
        <div style={{ width: 360 }}>
          <div style={{ height: 6, background: '#E4DFD5', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: procPct, background: accent, borderRadius: 999, transition: 'width .55s cubic-bezier(.4,0,.2,1)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 11, fontSize: 13, color: '#6B645A', fontFamily: "'Space Mono', monospace" }}>
            <span>{procCount} deals priced</span>
            <span>{procPct}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
