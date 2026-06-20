import { useStore } from '../store'
import { PRICING_TIERS } from '../constants'

const accent = 'oklch(0.57 0.2 25)'
const badge = 'oklch(0.86 0.16 92)'

export default function Pricing() {
  const { goHome, goSignin, goSignup, set } = useStore((s) => ({
    goHome: s.goHome, goSignin: s.goSignin, goSignup: s.goSignup, set: s.set,
  }))

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div className="sp-scroll" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 34px', position: 'sticky', top: 0, background: '#F6F3ED', zIndex: 5 }}>
          <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
            <div style={{ width: 24, height: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '0 7px 7px 0', background: accent, borderRadius: 5 }} />
              <div style={{ position: 'absolute', inset: '7px 0 0 7px', background: '#211D17', borderRadius: 5, mixBlendMode: 'multiply' }} />
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25 }}>Spread</span>
          </div>
          <div className="sp-nav" style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 14.5, color: '#6B645A' }}>
            <span onClick={goHome}>Home</span>
            <span onClick={goSignin}>Sign in</span>
            <span onClick={goSignup} style={{ background: '#211D17', color: '#F6F3ED', padding: '10px 18px', borderRadius: 999, fontWeight: 600 }}>Start free</span>
          </div>
        </div>

        <div style={{ flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto', padding: '18px 24px 70px' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '3px', color: '#8A8276', marginBottom: 16 }}>PRICING</div>
            <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 54, margin: '0 0 14px', letterSpacing: '-0.8px' }}>Plans that scale with your shelves</h1>
            <p style={{ fontSize: 17, color: '#6B645A', margin: 0 }}>Start free. Upgrade when your flyers go to print.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
            {PRICING_TIERS.map((t) => {
              const cardBg = t.highlight ? '#211D17' : '#fff'
              const textCol = t.highlight ? '#F6F3ED' : '#211D17'
              const subCol = t.highlight ? 'rgba(246,243,237,.7)' : '#9A9182'
              const featCol = t.highlight ? 'rgba(246,243,237,.92)' : '#3A352D'
              const tickCol = t.highlight ? badge : accent
              const shadow = t.highlight ? '0 18px 44px rgba(33,29,23,.28)' : '0 1px 3px rgba(33,29,23,.1)'
              const ctaBg = t.highlight ? '#F6F3ED' : accent
              const ctaFg = t.highlight ? '#211D17' : '#fff'
              return (
                <div key={t.key} className="sp-tier" style={{ background: cardBg, color: textCol, borderRadius: 18, padding: 28, boxShadow: shadow, position: 'relative', overflow: 'hidden' }}>
                  {t.highlight && (
                    <div style={{ position: 'absolute', top: 16, right: 16, fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '1px', background: badge, color: '#211D17', padding: '4px 10px', borderRadius: 999, fontWeight: 700 }}>POPULAR</div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>{t.name}</div>
                  <div style={{ fontSize: 13.5, color: subCol, marginBottom: 20 }}>{t.tagline}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 22 }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 46, lineHeight: 1 }}>{t.price}</span>
                    <span style={{ fontSize: 14, color: subCol }}>{t.per}</span>
                  </div>
                  <button onClick={() => set({ screen: 'signup' })} style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: 12, borderRadius: 11, background: ctaBg, color: ctaFg, marginBottom: 22 }}>{t.cta}</button>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                    {t.features.map((f) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, color: featCol }}>
                        <span style={{ color: tickCol, flex: 'none' }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
