import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import type { Template } from '../types'

const ACCENT = 'oklch(0.57 0.2 25)'
const ACCENT_SOFT = 'oklch(0.95 0.04 25)'
const ACCENT_BORDER = 'oklch(0.85 0.07 25)'

interface TemplateCard {
  key: Template
  name: string
  desc: string
  tag: string
  preview: () => JSX.Element
}

function MiniCell({ style, priceColor = ACCENT }: { style: React.CSSProperties; priceColor?: string }) {
  return (
    <div style={{ borderRadius: style.borderRadius ?? 8, overflow: 'hidden', background: style.background as string ?? '#fff', border: style.border as string ?? '1px solid #ECE8DF', flex: 1, display: 'flex', flexDirection: 'column', ...style }}>
      {style.borderTop && <div style={{ height: 4, background: ACCENT }} />}
      <div style={{ flex: 1, background: 'rgba(0,0,0,.05)', minHeight: 28 }} />
      <div style={{ padding: '5px 7px' }}>
        <div style={{ height: 5, borderRadius: 2, background: 'currentColor', opacity: 0.25, marginBottom: 4, width: '70%' }} />
        <div style={{ fontSize: 11, fontWeight: 700, color: priceColor, fontFamily: 'monospace' }}>$12.99</div>
      </div>
    </div>
  )
}

const TEMPLATES: TemplateCard[] = [
  {
    key: 'promo',
    name: 'Promo Grid',
    desc: 'The classic deal-cell layout. Clean white cards with badge savings and accent pricing.',
    tag: 'Popular',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{}} />)}
      </div>
    ),
  },
  {
    key: 'mega',
    name: 'Mega Saver',
    desc: 'Bold accent-colour stripe across the top of every cell. Perfect for hypermarket booklets.',
    tag: 'Bold',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{ borderTop: `4px solid ${ACCENT}` }} />)}
      </div>
    ),
  },
  {
    key: 'clean',
    name: 'Low Price',
    desc: 'Ultra-minimal styling. No badges, no pills — just the product and price. Great for premium brands.',
    tag: 'Minimal',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{ border: '1px solid #F0ECE3' }} priceColor="#211D17" />)}
      </div>
    ),
  },
  {
    key: 'bomb',
    name: 'Price Drop',
    desc: 'Lightly tinted cells using your accent colour. Grabs attention while staying readable.',
    tag: 'Vibrant',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{ background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}` }} />)}
      </div>
    ),
  },
  {
    key: 'spec',
    name: 'Big-Ticket',
    desc: 'Finance chips, specs layout. Best for appliances, electronics, and high-value items.',
    tag: 'Finance',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: `2px solid ${ACCENT_BORDER}`, background: '#fff' }}>
            <div style={{ height: 32, background: 'rgba(0,0,0,.05)' }} />
            <div style={{ padding: '4px 6px' }}>
              <div style={{ height: 4, borderRadius: 2, background: '#211D17', opacity: 0.2, marginBottom: 3, width: '80%' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, fontFamily: 'monospace' }}>$299.00</div>
              <div style={{ marginTop: 4, display: 'flex', gap: 3 }}>
                {['EMI','0%'].map(t => <span key={t} style={{ fontSize: 8, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 3, padding: '1px 3px', color: ACCENT, fontWeight: 600 }}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    key: 'dark',
    name: 'Night Mode',
    desc: 'Dark cells with white text and accent-coloured prices. Dramatic and eye-catching.',
    tag: 'Dark',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{ background: '#1E1A13', border: '1px solid #2A2520', color: '#F0ECE2' }} priceColor={ACCENT} />)}
      </div>
    ),
  },
  {
    key: 'neo',
    name: 'Neo Bold',
    desc: 'Sharp corners and thick black borders for a neo-brutalist editorial feel. No rounded edges.',
    tag: 'Editorial',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => <MiniCell key={i} style={{ borderRadius: 0, border: '2px solid #211D17' }} priceColor={ACCENT} />)}
      </div>
    ),
  },
  {
    key: 'pop',
    name: 'Pop & Flash',
    desc: 'Combines a tinted background with a bold top stripe. High energy for flash sales and promotions.',
    tag: 'Flash',
    preview: () => (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: 12 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ borderRadius: 8, overflow: 'hidden', background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ height: 4, background: ACCENT }} />
            <div style={{ flex: 1, background: 'rgba(0,0,0,.04)', minHeight: 28 }} />
            <div style={{ padding: '5px 7px' }}>
              <div style={{ height: 5, borderRadius: 2, background: '#211D17', opacity: 0.2, marginBottom: 4, width: '70%' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: ACCENT, fontFamily: 'monospace' }}>$9.99</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
]

export default function Templates() {
  const { goHome, goSignin, goSignup, goProjects, goPricing, loggedIn, set } = useStore(useShallow((s) => ({
    goHome: s.goHome, goSignin: s.goSignin, goSignup: s.goSignup,
    goProjects: s.goProjects, goPricing: s.goPricing, loggedIn: s.loggedIn, set: s.set,
  })))

  const handleUse = (key: Template) => {
    set({ template: key })
    if (loggedIn) set({ screen: 'csvUpload' })
    else goSignin()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      {/* Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 34px', borderBottom: '1px solid #E8E3D8' }}>
        <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <div style={{ width: 24, height: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: '0 7px 7px 0', background: ACCENT, borderRadius: 5 }} />
            <div style={{ position: 'absolute', inset: '7px 0 0 7px', background: '#211D17', borderRadius: 5, mixBlendMode: 'multiply' }} />
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25, letterSpacing: '0.3px' }}>Spread</span>
        </div>
        {loggedIn ? (
          <button onClick={goProjects} style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '9px 16px', borderRadius: 999, color: '#211D17' }}>← My projects</button>
        ) : (
          <div style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 14.5, color: '#6B645A' }}>
            <span onClick={goPricing} style={{ cursor: 'pointer' }}>Pricing</span>
            <span onClick={goSignin} style={{ cursor: 'pointer' }}>Sign in</span>
            <span onClick={goSignup} style={{ background: '#211D17', color: '#F6F3ED', padding: '10px 18px', borderRadius: 999, fontWeight: 600, cursor: 'pointer' }}>Start free</span>
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '52px 24px 40px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '3px', color: '#8A8276', marginBottom: 16 }}>CATALOG TEMPLATES</div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 52, lineHeight: 1.08, letterSpacing: '-0.8px', margin: '0 0 16px' }}>
          Pick a layout. Make it yours.
        </h1>
        <p style={{ fontSize: 17, color: '#6B645A', maxWidth: 520, margin: '0 auto', lineHeight: 1.55 }}>
          Every template works with your accent colour, grid size and page format. Switch anytime — no re-work needed.
        </p>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {TEMPLATES.map((t) => (
          <div key={t.key} style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8E3D8', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Preview */}
            <div style={{ background: '#F9F6F0', borderBottom: '1px solid #EDE8DF', minHeight: 130 }}>
              <t.preview />
            </div>
            {/* Info */}
            <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{t.name}</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.5px', background: ACCENT_SOFT, color: ACCENT, borderRadius: 99, padding: '2px 8px', border: `1px solid ${ACCENT_BORDER}` }}>{t.tag}</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#6B645A', margin: 0, lineHeight: 1.5, flex: 1 }}>{t.desc}</p>
              <button
                onClick={() => handleUse(t.key)}
                style={{ marginTop: 8, background: '#211D17', color: '#F6F3ED', border: 'none', borderRadius: 9, padding: '10px 0', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', width: '100%' }}
              >
                Use this template →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
