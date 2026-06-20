import { useState, useRef, useCallback } from 'react'
import { useStore } from '../store'
import { useShallow } from 'zustand/react/shallow'
import { parseCSV } from '../utils/csvParser'
import { makeProducts } from '../constants'
import type { Product } from '../types'

const accent = 'oklch(0.57 0.2 25)'

export default function CsvUpload() {
  const { loadCSV, goProjects, goHome, user } = useStore(useShallow((s) => ({
    loadCSV: s.loadCSV,
    goProjects: s.goProjects,
    goHome: s.goHome,
    user: s.user,
  })))

  const [dragging, setDragging] = useState(false)
  const [preview, setPreview] = useState<Product[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) { setError('Please upload a .csv file.'); return }
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const products = parseCSV(text)
      if (products.length === 0) {
        setError('No products found. Make sure your CSV has name, was and now columns.')
        return
      }
      setPreview(products)
    }
    reader.readAsText(file)
  }, [])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const buildCatalog = () => {
    if (preview) loadCSV(preview)
  }

  const downloadTemplate = () => {
    const csv = `name,category,was,now,desc,tag_text,tag_color,image_url
Sunflower Cooking Oil 1.8L,Pantry,5.95,3.50,Heart-healthy · Bottle,,,
Golden Basmati Rice 5kg,Pantry,12.90,8.95,Aged premium grain,,,
Fresh Whole Chicken,Fresh,4.20,2.75,Per kg · Farm fresh,FRESH,green,https://example.com/chicken.jpg
Atlantic Salmon Fillet,Fresh,18.90,13.50,Per kg · Skin-on,,,
Cavendish Bananas 1kg,Produce,1.30,0.85,Ecuador · Per kg,800 pts,violet,https://example.com/banana.jpg
Hass Avocado 4pk,Produce,5.60,3.40,Ready to eat,,,
Greek Yogurt 6x150g,Dairy,6.50,4.25,High protein,,,
Mature Cheddar 500g,Dairy,8.90,5.95,Block · Aged 12 months,,,
Samsung 65in QLED TV,Electronics,1299.00,899.00,4K Smart TV,HOT DEAL,violet,https://example.com/tv.jpg
Instant Pot Duo 7-in-1,Kitchen,99.00,59.00,6qt Pressure cooker,,,`
    const a = document.createElement('a')
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv)
    a.download = 'spread-studio-template.csv'
    a.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F6F3ED', fontFamily: "'Hanken Grotesk', sans-serif", color: '#211D17' }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 36px', borderBottom: '1px solid #EAE6DD', background: '#fff' }}>
        <div onClick={goHome} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 14, color: '#fff' }}>S</span>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Spread</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {user?.email && <span style={{ fontSize: 13, color: '#6B645A' }}>{user.email}</span>}
          <button onClick={goProjects} style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, padding: '8px 15px', borderRadius: 8, color: '#211D17' }}>My projects</button>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, letterSpacing: '3px', color: '#9A9182', marginBottom: 16 }}>STEP 1 OF 1</div>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 48, margin: '0 0 10px', letterSpacing: '-0.5px' }}>Upload your product list</h1>
        <p style={{ fontSize: 16, color: '#6B645A', margin: '0 0 40px', lineHeight: 1.5 }}>
          Drop a CSV with your products and prices. We'll build a full catalog instantly.
        </p>

        {/* Drop zone */}
        {!preview && (
          <div
            onDrop={onDrop}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? accent : '#CFC8BA'}`,
              borderRadius: 20, background: dragging ? 'oklch(0.97 0.01 25)' : '#FBF9F4',
              padding: '60px 40px', textAlign: 'center', cursor: 'pointer',
              transition: 'all .15s ease',
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 16 }}>📄</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Drop your CSV here</div>
            <div style={{ fontSize: 14, color: '#6B645A', marginBottom: 24 }}>or click to browse files</div>
            <div style={{ display: 'inline-block', background: accent, color: '#fff', padding: '11px 24px', borderRadius: 10, fontWeight: 700, fontSize: 14 }}>Choose file</div>
            <input ref={inputRef} type="file" accept=".csv" onChange={onFile} style={{ display: 'none' }} />
          </div>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'oklch(0.97 0.04 25)', border: '1px solid oklch(0.88 0.08 25)', color: 'oklch(0.45 0.18 25)', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Start from scratch */}
        {!preview && (
          <div style={{ marginTop: 24, padding: '20px 24px', borderRadius: 14, background: '#fff', border: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Start from scratch</div>
              <div style={{ fontSize: 13, color: '#6B645A' }}>Jump straight into the editor with sample products you can replace.</div>
            </div>
            <button
              onClick={() => loadCSV(makeProducts())}
              style={{ border: 'none', background: accent, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 9, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16 }}
            >
              Open editor →
            </button>
          </div>
        )}

        {/* Template download */}
        {!preview && (
          <div style={{ marginTop: 28, padding: '20px 24px', borderRadius: 14, background: '#fff', border: '1px solid #EAE6DD', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Don't have a CSV yet?</div>
              <div style={{ fontSize: 13, color: '#6B645A' }}>Download our template with all supported columns including image URLs.</div>
            </div>
            <button
              onClick={downloadTemplate}
              style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700, padding: '10px 18px', borderRadius: 9, color: '#211D17', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 16 }}
            >
              ↓ Download template
            </button>
          </div>
        )}

        {/* CSV columns reference */}
        {!preview && (
          <div style={{ marginTop: 24, padding: '20px 24px', borderRadius: 14, background: '#fff', border: '1px solid #EAE6DD' }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: '#9A9182', letterSpacing: '1px', marginBottom: 14 }}>SUPPORTED COLUMNS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
              {[
                ['name', 'Product name (required)'],
                ['category', 'Category / department'],
                ['was', 'Original price (required)'],
                ['now', 'Sale price (required)'],
                ['desc', 'Short description'],
                ['tag_text', 'Badge label e.g. FRESH'],
                ['tag_color', 'green · violet · blue'],
                ['image_url', 'URL to product image'],
              ].map(([col, desc]) => (
                <div key={col} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <code style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, background: '#F0ECE3', padding: '2px 7px', borderRadius: 5, color: accent, flexShrink: 0 }}>{col}</code>
                  <span style={{ fontSize: 12.5, color: '#6B645A', lineHeight: 1.4 }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>✓ {preview.length} products loaded from <span style={{ color: accent }}>{fileName}</span></div>
                <div style={{ fontSize: 13, color: '#6B645A', marginTop: 4 }}>Review your products below, then build the catalog.</div>
              </div>
              <button
                onClick={() => { setPreview(null); setFileName(''); setError(null) }}
                style={{ border: '1px solid #E0DACE', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: '8px 14px', borderRadius: 8, color: '#6B645A' }}
              >
                Upload different file
              </button>
            </div>

            <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #EAE6DD' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F0ECE3' }}>
                    {['#', 'Name', 'Category', 'Was', 'Now', 'Save %', 'Image'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: '0.5px', color: '#9A9182', fontWeight: 400, borderBottom: '1px solid #EAE6DD' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 20).map((p, i) => {
                    const pct = p.was > 0 ? Math.round(((p.was - p.now) / p.was) * 100) : 0
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #F0ECE3', background: i % 2 === 0 ? '#fff' : '#FDFCF9' }}>
                        <td style={{ padding: '9px 14px', color: '#9A9182', fontFamily: "'Space Mono', monospace", fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</td>
                        <td style={{ padding: '9px 14px', fontWeight: 600 }}>{p.name}</td>
                        <td style={{ padding: '9px 14px', color: '#6B645A' }}>{p.category}</td>
                        <td style={{ padding: '9px 14px', color: '#9A9182', textDecoration: 'line-through' }}>${p.was.toFixed(2)}</td>
                        <td style={{ padding: '9px 14px', fontWeight: 700, color: accent }}>${p.now.toFixed(2)}</td>
                        <td style={{ padding: '9px 14px' }}>
                          {pct > 0 && <span style={{ background: 'oklch(0.95 0.04 25)', color: accent, padding: '2px 7px', borderRadius: 6, fontWeight: 700, fontSize: 11 }}>-{pct}%</span>}
                        </td>
                        <td style={{ padding: '9px 14px' }}>
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 5, border: '1px solid #EAE6DD' }} />
                          ) : (
                            <span style={{ fontSize: 11, color: '#C2BBA8' }}>—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {preview.length > 20 && (
                <div style={{ padding: '10px 14px', background: '#F9F7F3', fontSize: 12, color: '#9A9182', textAlign: 'center' }}>
                  + {preview.length - 20} more products
                </div>
              )}
            </div>

            <button
              onClick={buildCatalog}
              style={{ width: '100%', marginTop: 24, padding: '16px', border: 'none', borderRadius: 14, background: accent, color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer' }}
            >
              Build catalog with {preview.length} products →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
