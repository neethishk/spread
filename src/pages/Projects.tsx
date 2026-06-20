import { useStore } from '../store'

const accent = 'oklch(0.57 0.2 25)'

export default function Projects() {
  const { projects, goPricing, signOut, newProject, openProject, user } = useStore((s) => ({
    projects: s.projects, goPricing: s.goPricing, signOut: s.signOut,
    newProject: s.newProject, openProject: s.openProject, user: s.user,
  }))

  const initial = user?.email?.[0]?.toUpperCase() ?? 'A'

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#F6F3ED', color: '#211D17', fontFamily: "'Hanken Grotesk', system-ui, sans-serif" }}>
      <div className="sp-scroll" style={{ height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 40px', borderBottom: '1px solid #EAE6DD' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 24, height: 24, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: '0 7px 7px 0', background: accent, borderRadius: 5 }} />
              <div style={{ position: 'absolute', inset: '7px 0 0 7px', background: '#211D17', borderRadius: 5, mixBlendMode: 'multiply' }} />
            </div>
            <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 25 }}>Spread</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span onClick={goPricing} style={{ cursor: 'pointer', fontSize: 14, color: '#6B645A' }}>Pricing</span>
            <div
              onClick={signOut} title="Sign out"
              style={{ width: 34, height: 34, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {initial}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, width: '100%', maxWidth: 1080, margin: '0 auto', padding: '40px 40px 70px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
            <div>
              <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 42, margin: '0 0 4px' }}>Your projects</h1>
              <p style={{ fontSize: 14.5, color: '#6B645A', margin: 0 }}>
                {projects.length} {projects.length === 1 ? 'catalog' : 'catalogs'}
              </p>
            </div>
            <button
              onClick={newProject}
              style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '12px 20px', borderRadius: 11, background: '#211D17', color: '#F6F3ED', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> New project
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
            {/* New project card */}
            <div
              onClick={newProject} className="sp-proj"
              style={{ cursor: 'pointer', border: '2px dashed #CFC8BA', borderRadius: 16, background: '#FBF9F4', minHeight: 230, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#6B645A' }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 13, background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>+</div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>New project</div>
              <div style={{ fontSize: 12.5, color: '#9A9182' }}>Import a price list</div>
            </div>

            {projects.map((p) => (
              <div
                key={p.id} onClick={() => openProject(p.id)} className="sp-proj"
                style={{ cursor: 'pointer', borderRadius: 16, background: '#fff', boxShadow: '0 1px 3px rgba(33,29,23,.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: 140, background: p.accent, color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '1px', opacity: 0.9 }}>{p.store}</div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.88, transform: 'skewX(-7deg)', transformOrigin: 'left' }}>
                    {p.headline1}<br />{p.headline2}
                  </div>
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: 5, background: p.badge }} />
                </div>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>
                    <span>{p.dealCount} deals</span>
                    <span>{p.updated}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
