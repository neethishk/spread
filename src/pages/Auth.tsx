import { useState } from 'react'
import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const accent = 'oklch(0.57 0.2 25)'

export default function Auth() {
  const { screen, goHome, toggleAuthMode, doAuth } = useStore(useShallow((s) => ({
    screen: s.screen, goHome: s.goHome, toggleAuthMode: s.toggleAuthMode, doAuth: s.doAuth,
  })))
  const isSignup = screen === 'signup'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    setLoading(true); setError(null)
    const err = await doAuth(email, password, isSignup)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif", display: 'flex' }}>
      {/* Left panel */}
      <div style={{ flex: 1, background: accent, color: '#fff', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
        <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontFamily: "'Anton', sans-serif", fontSize: 16 }}>S</div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Spread</span>
        </div>
        <div>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 46, lineHeight: 1.05, margin: '0 0 18px', letterSpacing: '-0.5px' }}>From spreadsheet to print-ready flyer.</h2>
          <p style={{ fontSize: 16, opacity: 0.9, maxWidth: 380, lineHeight: 1.5, margin: 0 }}>Join retail teams turning weekly price lists into beautiful multi-page booklets — no designer required.</p>
        </div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, opacity: 0.8, letterSpacing: '1px' }}>TRUSTED BY 4,200+ STORES</div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, minWidth: 0 }}>
        <div style={{ width: 380, maxWidth: '100%' }}>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 38, margin: '0 0 6px' }}>
            {isSignup ? 'Create your account' : 'Welcome back'}
          </h1>
          <p style={{ fontSize: 14.5, color: '#6B645A', margin: '0 0 28px' }}>
            {isSignup ? 'Start building flyers in minutes — no card required.' : 'Sign in to your Spread projects.'}
          </p>
          {isSignup && (
            <>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Full name</label>
              <input
                className="sp-in" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera" style={{ marginBottom: 14 }}
              />
            </>
          )}
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Work email</label>
          <input
            className="sp-in" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@store.com" style={{ marginBottom: 14 }}
          />
          <label style={{ fontSize: 11.5, fontWeight: 700, color: '#6B645A', display: 'block', marginBottom: 6 }}>Password</label>
          <input
            className="sp-in" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••" style={{ marginBottom: 22 }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {error && (
            <div style={{ fontSize: 13, color: 'oklch(0.55 0.2 25)', marginBottom: 12, background: 'oklch(0.95 0.04 25)', padding: '9px 12px', borderRadius: 9 }}>
              {error}
            </div>
          )}
          <button
            onClick={submit} disabled={loading}
            style={{ width: '100%', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, padding: 13, borderRadius: 11, background: accent, color: '#fff', marginBottom: 18, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Please wait…' : (isSignup ? 'Create account' : 'Sign in')}
          </button>
          <div style={{ textAlign: 'center', fontSize: 13.5, color: '#6B645A' }}>
            {isSignup ? 'Already have an account?' : 'New to Spread?'}{' '}
            <span onClick={toggleAuthMode} style={{ cursor: 'pointer', color: accent, fontWeight: 700 }}>
              {isSignup ? 'Sign in' : 'Create one'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
