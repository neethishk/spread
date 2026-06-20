import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const SOURCES = ['CSV', 'Excel', 'Shopify', 'Airtable', 'PIM feed']

export default function Home() {
  const { goHome, goPricing, goSignin, goSignup, goProjects, loggedIn, set } = useStore(useShallow((s) => ({
    goHome: s.goHome, goPricing: s.goPricing, goSignin: s.goSignin, goSignup: s.goSignup,
    goProjects: s.goProjects, loggedIn: s.loggedIn, set: s.set,
  })))

  const handleUpload = () => {
    if (loggedIn) set({ screen: 'csvUpload' })
    else goSignin()
  }

  const accent = 'oklch(0.57 0.2 25)'

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Navbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 34px' }}>
          <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
            <div style={{ width: 24, height: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '0 7px 7px 0', background: accent, borderRadius: 5 }} />
              <div style={{ position: 'absolute', inset: '7px 0 0 7px', background: '#211D17', borderRadius: 5, mixBlendMode: 'multiply' }} />
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25, letterSpacing: '0.3px' }}>Spread</span>
          </div>
          {loggedIn ? (
            <button onClick={goProjects} style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, padding: '9px 16px', borderRadius: 999, color: '#211D17' }}>← My projects</button>
          ) : (
            <div className="sp-nav" style={{ display: 'flex', gap: 28, alignItems: 'center', fontSize: 14.5, color: '#6B645A' }}>
              <span onClick={goPricing}>Templates</span>
              <span onClick={goPricing}>Pricing</span>
              <span onClick={goSignin}>Sign in</span>
              <span onClick={goSignup} style={{ background: '#211D17', color: '#F6F3ED', padding: '10px 18px', borderRadius: 999, fontWeight: 600 }}>Start free</span>
            </div>
          )}
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px 40px' }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, letterSpacing: '3.5px', color: '#8A8276', marginBottom: 24 }}>CATALOG STUDIO FOR RETAIL</div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 70, lineHeight: 1.01, letterSpacing: '-1.2px', maxWidth: 880, margin: '0 0 22px', textWrap: 'balance' } as React.CSSProperties}>
            Upload your price list.<br />
            Get a finished <span style={{ fontStyle: 'italic', color: accent }}>promo booklet</span> in seconds.
          </h1>
          <p style={{ fontSize: 18.5, color: '#6B645A', maxWidth: 560, margin: '0 0 40px', lineHeight: 1.5 }}>
            Drop a product sheet and Spread paginates a full multi-page flyer — then edit any element, swap layouts and export print-ready PDF or InDesign.
          </p>

          {/* Drop zone */}
          <div
            onClick={handleUpload}
            className="sp-up"
            style={{ cursor: 'pointer', width: 'min(620px, 92vw)', border: '2px dashed #CFC8BA', borderRadius: 24, background: '#FBF9F4', padding: 42, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, animation: 'floaty 3s ease-in-out infinite' }}>↑</div>
            <div style={{ fontSize: 19, fontWeight: 600 }}>Drop a spreadsheet, CSV, or Shopify export</div>
            <div style={{ fontSize: 14.5, color: '#6B645A' }}>
              columns for name, was &amp; now prices —{' '}
              <span style={{ color: accent, fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 }}>browse files</span>
            </div>
          </div>

          <button onClick={handleUpload} style={{ marginTop: 28, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Hanken Grotesk', sans-serif", fontSize: 15, color: '#211D17', fontWeight: 600, borderBottom: '2px solid ' + accent, padding: '0 0 3px' }}>
            Try it with a sample hypermarket booklet →
          </button>

          <div style={{ marginTop: 48, display: 'flex', gap: 9, flexWrap: 'wrap', justifyContent: 'center' }}>
            {SOURCES.map((s) => (
              <span key={s} style={{ fontFamily: "'Space Mono', monospace", fontSize: 11.5, color: '#8A8276', border: '1px solid #E0DACE', borderRadius: 999, padding: '6px 13px', background: '#FBF9F4' }}>{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
