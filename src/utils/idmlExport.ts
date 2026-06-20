import JSZip from 'jszip'
import type { Product, Cover, BannerDef, Template, GridKey, PageSize, Orientation } from '../types'

// A4 portrait in points (1pt = 1/72 inch)
const PAGE_SIZES: Record<PageSize, { w: number; h: number }> = {
  a4:     { w: 595.276, h: 841.890 },
  a5:     { w: 419.528, h: 595.276 },
  a3:     { w: 841.890, h: 1190.551 },
  letter: { w: 612.000, h: 792.000 },
  square: { w: 595.276, h: 595.276 },
}

const GRID_COLS: Record<GridKey, number> = { '2x2': 2, '2x3': 2, '3x3': 3, '3x4': 3, '4x4': 4 }
const GRID_ROWS: Record<GridKey, number> = { '2x2': 2, '2x3': 3, '3x3': 3, '3x4': 4, '4x4': 4 }

let _storyCounter = 200

function sid() { return `u${++_storyCounter}` }


function textStory(id: string, text: string, fontSize = 10, bold = false): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Story xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <Story Self="${id}" AppliedTOCStyle="n" TrackChanges="false" StoryTitle="">
    <ParagraphStyleRange AppliedParagraphStyle="ParagraphStyle/$ID/NormalParagraphStyle">
      <CharacterStyleRange AppliedCharacterStyle="CharacterStyle/$ID/[No character style]"
        FontStyle="${bold ? 'Bold' : 'Regular'}" PointSize="${fontSize}">
        <Content>${escXml(text)}</Content>
      </CharacterStyleRange>
    </ParagraphStyleRange>
  </Story>
</idPkg:Story>`
}

function escXml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function textFrame(selfId: string, storyId: string, x: number, y: number, w: number, h: number): string {
  return `<TextFrame Self="${selfId}" ParentStory="${storyId}"
    GeometricBounds="${y} ${x} ${y + h} ${x + w}"
    ItemTransform="1 0 0 1 ${x} ${y}"
    ContentType="TextType">
    <TextFramePreference TextColumnCount="1" TextColumnFixedWidth="${w}"/>
  </TextFrame>`
}

function rectFrame(selfId: string, x: number, y: number, w: number, h: number, fill = '#FFFFFF'): string {
  return `<Rectangle Self="${selfId}"
    GeometricBounds="${y} ${x} ${y + h} ${x + w}"
    ItemTransform="1 0 0 1 ${x} ${y}"
    FillColor="Color/${fill.replace('#', '')}">
  </Rectangle>`
}

function spreadXml(spreadId: string, pageId: string, pw: number, ph: number, frames: string[]): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Spread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <Spread Self="${spreadId}" PageCount="1" AllowPageShuffle="true">
    <Page Self="${pageId}" GeometricBounds="0 0 ${ph} ${pw}" ItemTransform="1 0 0 1 0 0">
      <MarginPreference ColumnCount="1" ColumnGutter="12" Top="36" Bottom="36" Left="36" Right="36" ColumnDirection="Horizontal"/>
    </Page>
    ${frames.join('\n    ')}
  </Spread>
</idPkg:Spread>`
}

export async function exportIDML(
  products: Product[],
  cover: Cover,
  banners: Record<string, BannerDef>,
  template: Template,
  gridKey: GridKey,
  pageSize: PageSize,
  orientation: Orientation,
  catalogName: string,
  _accent: string,
): Promise<void> {
  _storyCounter = 200
  const zip = new JSZip()

  const { w: rawW, h: rawH } = PAGE_SIZES[pageSize] ?? PAGE_SIZES.a4
  const pw = orientation === 'landscape' ? rawH : rawW
  const ph = orientation === 'landscape' ? rawW : rawH

  const margin = 36
  const contentW = pw - margin * 2
  const contentH = ph - margin * 2

  const cols = GRID_COLS[gridKey] ?? 3
  const rows = GRID_ROWS[gridKey] ?? 3
  const perPage = cols * rows
  const cellGap = 8
  const cellW = (contentW - (cols - 1) * cellGap) / cols
  const cellH = (contentH - 80 - (rows - 1) * cellGap) / rows  // 80 for banner

  const stories: Record<string, string> = {}
  const spreadIds: string[] = []
  const storyIds: string[] = []

  // ── Cover spread ──────────────────────────────────────────────────────────
  const covSpreadId = sid()
  const covPageId = sid()
  const covBrandStory = sid(); storyIds.push(covBrandStory)
  const covH1Story = sid(); storyIds.push(covH1Story)
  const covH2Story = sid(); storyIds.push(covH2Story)
  const covBurstStory = sid(); storyIds.push(covBurstStory)
  const covValidStory = sid(); storyIds.push(covValidStory)

  stories[covBrandStory] = textStory(covBrandStory, cover.brand, 14, true)
  stories[covH1Story] = textStory(covH1Story, cover.headline1, Math.round(pw * 0.12), true)
  stories[covH2Story] = textStory(covH2Story, cover.headline2, Math.round(pw * 0.12), true)
  stories[covBurstStory] = textStory(covBurstStory, cover.burst, 16, true)
  stories[covValidStory] = textStory(covValidStory, cover.validity, 10)

  const covFrames = [
    rectFrame(sid(), 0, 0, pw, ph, '#CC2222'),
    textFrame(sid(), covBrandStory, margin, margin, contentW, 30),
    textFrame(sid(), covH1Story, margin, ph * 0.3, contentW, 80),
    textFrame(sid(), covH2Story, margin, ph * 0.42, contentW, 80),
    textFrame(sid(), covBurstStory, margin, ph * 0.6, contentW, 40),
    textFrame(sid(), covValidStory, margin, ph * 0.72, contentW, 25),
  ]
  spreadIds.push(covSpreadId)
  const covSpreadXml = spreadXml(covSpreadId, covPageId, pw, ph, covFrames)

  // ── Content pages ─────────────────────────────────────────────────────────
  const ban = banners[template] ?? { title: 'DEALS', sub: '' }
  const contentPages: Array<{ spreadId: string; xml: string }> = []

  for (let pi = 0; pi * perPage < products.length || pi === 0; pi++) {
    const slice = products.slice(pi * perPage, (pi + 1) * perPage)
    const spreadId = sid()
    const pageId = sid()
    spreadIds.push(spreadId)

    const bannerTitleStory = sid(); storyIds.push(bannerTitleStory)
    stories[bannerTitleStory] = textStory(bannerTitleStory, ban.title, 16, true)

    const frames: string[] = [
      rectFrame(sid(), 0, 0, pw, 58, '#CC2222'),
      textFrame(sid(), bannerTitleStory, margin, 14, contentW, 30),
    ]

    slice.forEach((p, ci) => {
      const col = ci % cols
      const row = Math.floor(ci / cols)
      const cx = margin + col * (cellW + cellGap)
      const cy = margin + 80 + row * (cellH + cellGap)

      const nameStory = sid(); storyIds.push(nameStory)
      const priceStory = sid(); storyIds.push(priceStory)
      const wasStory = sid(); storyIds.push(wasStory)
      const descStory = sid(); storyIds.push(descStory)

      stories[nameStory] = textStory(nameStory, p.name || 'Product', 11, true)
      stories[priceStory] = textStory(priceStory, `$${p.now.toFixed(2)}`, 18, true)
      stories[wasStory] = textStory(wasStory, p.was > p.now ? `WAS $${p.was.toFixed(2)}` : '', 8)
      stories[descStory] = textStory(descStory, p.desc || '', 8)

      const imgH = cellH * 0.5
      const textY = cy + imgH
      const textH = cellH - imgH

      frames.push(
        rectFrame(sid(), cx, cy, cellW, cellH, '#F3F1EC'),
        // Image placeholder
        rectFrame(sid(), cx + 2, cy + 2, cellW - 4, imgH - 4, '#E0DAD0'),
        // Text frames
        textFrame(sid(), nameStory, cx + 6, textY + 4, cellW - 12, 20),
        textFrame(sid(), descStory, cx + 6, textY + 24, cellW - 12, 14),
        textFrame(sid(), wasStory, cx + 6, textY + textH - 30, cellW - 12, 14),
        textFrame(sid(), priceStory, cx + 6, textY + textH - 20, cellW - 12, 22),
      )
    })

    contentPages.push({ spreadId, xml: spreadXml(spreadId, pageId, pw, ph, frames) })
  }

  // ── Build ZIP ─────────────────────────────────────────────────────────────
  const allSpreadSrcs = [
    `<idPkg:Spread src="Spreads/Spread_${covSpreadId}.xml"/>`,
    ...contentPages.map(p => `<idPkg:Spread src="Spreads/Spread_${p.spreadId}.xml"/>`),
  ].join('\n  ')

  const designmap = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Document xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging"
  DOMVersion="19.0" StoryList="${storyIds.join(' ')}"
  ActiveProcess="" TransparencyAttributeDefaultProperty="n"
  FullName="${escXml(catalogName)}.indd">
  <idPkg:Fonts src="Resources/Fonts.xml"/>
  <idPkg:Graphic src="Resources/Graphic.xml"/>
  <idPkg:Styles src="Resources/Styles.xml"/>
  <idPkg:Preferences src="Resources/Preferences.xml"/>
  <idPkg:MasterSpread src="MasterSpreads/MasterSpread_u101.xml"/>
  ${allSpreadSrcs}
  ${storyIds.map(id => `<idPkg:Story src="Stories/Story_${id}.xml"/>`).join('\n  ')}
</idPkg:Document>`

  const fonts = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Fonts xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <FontFamily Self="FontFamily/$ID/Helvetica Neue" Name="Helvetica Neue"/>
</idPkg:Fonts>`

  const graphic = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Graphic xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <Color Self="Color/CC2222" Model="RGB" Space="RGB" ColorValue="204 34 34" Name="Spread Red"/>
  <Color Self="Color/FFFFFF" Model="RGB" Space="RGB" ColorValue="255 255 255" Name="White"/>
  <Color Self="Color/F3F1EC" Model="RGB" Space="RGB" ColorValue="243 241 236" Name="Cell Cream"/>
  <Color Self="Color/E0DAD0" Model="RGB" Space="RGB" ColorValue="224 218 208" Name="Image Placeholder"/>
  <Color Self="Color/CC2222" Model="RGB" Space="RGB" ColorValue="204 34 34" Name="Accent Red"/>
</idPkg:Graphic>`

  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Styles xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <RootParagraphStyleGroup Self="rootParagraphStyleGroup">
    <ParagraphStyle Self="ParagraphStyle/$ID/NormalParagraphStyle" Name="$ID/NormalParagraphStyle"/>
  </RootParagraphStyleGroup>
  <RootCharacterStyleGroup Self="rootCharacterStyleGroup">
    <CharacterStyle Self="CharacterStyle/$ID/[No character style]" Name="$ID/[No character style]"/>
  </RootCharacterStyleGroup>
  <RootObjectStyleGroup Self="rootObjectStyleGroup">
    <ObjectStyle Self="ObjectStyle/$ID/[None]" Name="$ID/[None]"/>
  </RootObjectStyleGroup>
</idPkg:Styles>`

  const prefs = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:Preferences xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <DocumentPreference PageWidth="${pw}" PageHeight="${ph}" FacingPages="false"
    PagesPerDocument="${1 + contentPages.length}" DocumentBleedTopOffset="${bleedPts()}"
    DocumentBleedBottomOffset="${bleedPts()}" DocumentBleedInsideOrLeftOffset="${bleedPts()}"
    DocumentBleedOutsideOrRightOffset="${bleedPts()}"/>
</idPkg:Preferences>`

  const masterSpread = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<idPkg:MasterSpread xmlns:idPkg="http://ns.adobe.com/AdobeInDesign/idml/1.0/packaging" DOMVersion="19.0">
  <MasterSpread Self="u101" NamePrefix="A" BaseName="Master" PageCount="1">
    <Page Self="u101a" GeometricBounds="0 0 ${ph} ${pw}" ItemTransform="1 0 0 1 0 0">
      <MarginPreference ColumnCount="1" Top="36" Bottom="36" Left="36" Right="36"/>
    </Page>
  </MasterSpread>
</idPkg:MasterSpread>`

  zip.file('mimetype', 'application/vnd.adobe.indesign-idml-package', { compression: 'STORE' })
  zip.file('designmap.xml', designmap)
  zip.file('Resources/Fonts.xml', fonts)
  zip.file('Resources/Graphic.xml', graphic)
  zip.file('Resources/Styles.xml', styles)
  zip.file('Resources/Preferences.xml', prefs)
  zip.file('MasterSpreads/MasterSpread_u101.xml', masterSpread)
  zip.file(`Spreads/Spread_${covSpreadId}.xml`, covSpreadXml)
  contentPages.forEach(p => zip.file(`Spreads/Spread_${p.spreadId}.xml`, p.xml))
  Object.entries(stories).forEach(([id, content]) => zip.file(`Stories/Story_${id}.xml`, content))

  const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/octet-stream' })

  const safeSlug = catalogName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${safeSlug}.idml`
  a.click()
  URL.revokeObjectURL(a.href)
}

function bleedPts() { return 8.504 } // 3mm in points
