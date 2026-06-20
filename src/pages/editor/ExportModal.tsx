import { useStore } from '../../store'
import { computeAccent, computePageDimensions, ring, swX, gridTokens } from './helpers'

export default function ExportModal() {
  const {
    exportOpen, exportFormat, exportStage, bleed,
    products, manualPages, pageSize, orientation, gridKey,
    accentKey, customAccent, catalogName, template,
    set, generateExport,
  } = useStore((s) => ({
    exportOpen: s.exportOpen, exportFormat: s.exportFormat,
    exportStage: s.exportStage, bleed: s.bleed,
    products: s.products, manualPages: s.manualPages,
    pageSize: s.pageSize, orientation: s.orientation, gridKey: s.gridKey,
    accentKey: s.accentKey, customAccent: s.customAccent,
    catalogName: s.catalogName, template: s.template,
    set: s.set, generateExport: s.generateExport,
  }))

  if (!exportOpen) return null

  const ac = computeAccent(accentKey, customAccent)
  const accent = ac.color
  const { pageH, sizeLabel } = computePageDimensions(pageSize, orientation)
  const gtk = gridTokens(gridKey, pageH, template)

  // count total pages: 1 cover + content pages + manual pages
  let contentPageCount = 0
  let gi = 0
  while (gi < products.length) {
    gi += gtk.perPage
    contentPageCount++
  }
  if (contentPageCount === 0) contentPageCount = 1
  const totalPages = contentPageCount + 1 + manualPages.length

  const formatLabel = exportFormat === 'pdf' ? 'PDF' : 'InDesign'
  const safeSlug = (catalogName || 'catalog').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const fileName = exportFormat === 'pdf' ? `${safeSlug}.pdf` : `${safeSlug}.indd`

  const closeExport = () => set({ exportOpen: false })
  const stopProp = (e: React.MouseEvent) => e.stopPropagation()

  return (
    <div
      onClick={closeExport}
      style={{ position: 'absolute', inset: 0, background: 'rgba(33,29,23,.5)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
    >
      <div
        onClick={stopProp}
        style={{ width: 580, maxWidth: '92vw', background: '#FBF9F4', borderRadius: 20, padding: 32, boxShadow: '0 40px 100px rgba(0,0,0,.35)' }}
      >
        {exportStage === 'config' && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontSize: 32, margin: 0 }}>Export booklet</h3>
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: '#9A9182' }}>
                {products.length} deals · {totalPages} pages · {sizeLabel}
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#6B645A', margin: '0 0 22px' }}>Choose your output format.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div
                onClick={() => set({ exportFormat: 'pdf' })}
                style={{ cursor: 'pointer', borderRadius: 14, padding: 20, background: '#fff', boxShadow: ring(exportFormat === 'pdf', accent) }}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>🖨</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>Print-ready PDF</div>
                <div style={{ fontSize: 12.5, color: '#6B645A', lineHeight: 1.4 }}>300dpi, CMYK with crop marks & bleed — ready for the press.</div>
              </div>
              <div
                onClick={() => set({ exportFormat: 'indd' })}
                style={{ cursor: 'pointer', borderRadius: 14, padding: 20, background: '#fff', boxShadow: ring(exportFormat === 'indd', accent) }}
              >
                <div style={{ fontSize: 24, marginBottom: 12 }}>✦</div>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 5 }}>Adobe InDesign</div>
                <div style={{ fontSize: 12.5, color: '#6B645A', lineHeight: 1.4 }}>Packaged .indd with linked images & live text — fully editable.</div>
              </div>
            </div>
            <div
              onClick={() => set({ bleed: !bleed })}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: '#fff', borderRadius: 11, padding: '13px 16px', marginBottom: 24 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 13.5 }}>Crop marks & 3mm bleed</div>
                <div style={{ fontSize: 11.5, color: '#9A9182' }}>Recommended for professional printing</div>
              </div>
              <div style={{ width: 42, height: 24, borderRadius: 999, background: bleed ? accent : '#D5CEC1', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 2, left: swX(bleed), width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left .15s' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
              <button onClick={closeExport} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 600, color: '#6B645A' }}>Cancel</button>
              <button
                onClick={generateExport}
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '12px 24px', borderRadius: 10, background: accent, color: '#fff' }}
              >
                Generate {formatLabel}
              </button>
            </div>
          </>
        )}

        {exportStage === 'generating' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '30px 0' }}>
            <div style={{ width: 44, height: 44, border: '4px solid #E4DFD5', borderTopColor: accent, borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Rendering your booklet…</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12.5, color: '#9A9182' }}>
              Laying out {totalPages} pages at {sizeLabel}
            </div>
          </div>
        )}

        {exportStage === 'ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '18px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: accent, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>✓</div>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30 }}>Your booklet is ready</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: '#6B645A', background: '#fff', border: '1px solid #EFEADF', padding: '10px 16px', borderRadius: 10 }}>
              {fileName}
            </div>
            <button style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, padding: '13px 28px', borderRadius: 10, background: '#211D17', color: '#F6F3ED', marginTop: 4 }}>
              Download {formatLabel}
            </button>
            <button onClick={closeExport} style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#9A9182' }}>
              Back to editor
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
