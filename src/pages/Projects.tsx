import { useState } from 'react'
import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'

const accent = 'oklch(0.57 0.2 25)'

export default function Projects() {
  const { projects, goPricing, signOut, newProject, openProject, deleteProject, renameProject, user } = useStore(useShallow((s) => ({
    projects: s.projects, goPricing: s.goPricing, signOut: s.signOut,
    newProject: s.newProject, openProject: s.openProject,
    deleteProject: s.deleteProject, renameProject: s.renameProject, user: s.user,
  })))

  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const startRename = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    setRenamingId(id)
    setRenameVal(name)
  }

  const commitRename = (id: string) => {
    if (renameVal.trim()) renameProject(id, renameVal.trim())
    setRenamingId(null)
  }

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation()
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) deleteProject(id)
  }

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
            {user?.email && <span style={{ fontSize: 13, color: '#6B645A' }}>{user.email}</span>}
            <button
              onClick={signOut}
              style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '8px 15px', borderRadius: 8, color: '#211D17' }}
            >
              Log out
            </button>
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
                key={p.id} className="sp-proj"
                style={{ cursor: 'pointer', borderRadius: 16, background: '#fff', boxShadow: '0 1px 3px rgba(33,29,23,.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => openProject(p.id)}
                  style={{ height: 140, background: p.accent, color: '#fff', padding: 18, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}
                >
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '1px', opacity: 0.9 }}>{p.store}</div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.88, transform: 'skewX(-7deg)', transformOrigin: 'left' }}>
                    {p.headline1}<br />{p.headline2}
                  </div>
                  <div style={{ position: 'absolute', top: 14, right: 14, width: 20, height: 20, borderRadius: 5, background: p.badge }} />
                </div>

                {/* Card footer */}
                <div style={{ padding: '12px 16px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {renamingId === p.id ? (
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={() => commitRename(p.id)}
                      onKeyDown={(e) => { if (e.key === 'Enter') commitRename(p.id); if (e.key === 'Escape') setRenamingId(null) }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontWeight: 700, fontSize: 15, border: 'none', outline: `2px solid ${accent}`, borderRadius: 5, padding: '2px 5px', fontFamily: 'inherit', color: '#211D17', width: '100%' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        onClick={() => openProject(p.id)}
                        style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}
                      >
                        {p.name}
                      </div>
                      <button
                        onClick={(e) => startRename(e, p.id, p.name)}
                        title="Rename"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#B7AE9E', fontSize: 12, padding: '2px 4px', borderRadius: 5, flex: 'none' }}
                      >
                        ✎
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#9A9182' }}>
                      {p.dealCount} deals · {p.updated}
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, p.id, p.name)}
                      title="Delete project"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#C2BBA8', fontSize: 13, padding: '2px 4px', borderRadius: 5 }}
                    >
                      ✕
                    </button>
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
