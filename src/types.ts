export interface FreeElement {
  id: string
  type: 'text' | 'image' | 'rect' | 'ellipse' | 'badge' | 'promo-band' | 'brand-header' | 'sticker' | 'price-tag'
  x: number       // % of page width
  y: number       // % of page height
  w: number       // % of page width
  h: number       // % of page height
  fill: string
  stroke: string
  strokeW: number
  opacity: number
  text: string
  text2?: string
  text3?: string
  fontSize: number
  bold: boolean
  italic: boolean
  fontColor: string
  textAlign: 'left' | 'center' | 'right'
  imageUrl: string
  fit: 'cover' | 'contain' | 'fill'
  zIndex: number
  groupId: string | null
}

export type Screen = 'upload' | 'pricing' | 'signin' | 'signup' | 'projects' | 'processing' | 'editor' | 'csvUpload'
export type Template = 'promo' | 'mega' | 'clean' | 'bomb' | 'spec' | 'custom'
export type GridKey = '2x2' | '2x3' | '3x3' | '3x4' | '4x4'
export type PageSize = 'a5' | 'a4' | 'a3' | 'letter' | 'square'
export type Orientation = 'portrait' | 'landscape'
export type AccentKey = 'red' | 'orange' | 'magenta' | 'green' | 'blue' | 'purple' | 'custom'
export type ExportFormat = 'pdf' | 'indd'
export type ExportStage = 'config' | 'generating' | 'ready'

export interface Tag { t: string; col: 'green' | 'violet' | 'blue' | 'custom'; customCol?: string }

export interface ProductOverride {
  bg?: 'default' | 'white' | 'cream' | 'tint' | 'accent' | 'custom'
  customBg?: string
  imgPos?: 'top' | 'left'
  pad?: 0 | 1 | 2 | 4
  span2?: boolean
  nameWeight?: 400 | 600 | 700 | 800
  upper?: boolean
  radius?: number
  opacity?: number
  shadow?: boolean
  borderOn?: boolean
  borderW?: number
  borderColor?: string
  align?: 'left' | 'center' | 'right'
}

export interface Product {
  id: string
  name: string
  desc: string
  category: string
  was: number
  now: number
  imageUrl?: string
  tag: Tag | null
  align: 'left' | 'center' | 'right'
  text: string
  showDesc: boolean
  showBadge: boolean
  showImage: boolean
  showTitle: boolean
  showPrice: boolean
  showDiscount: boolean
  showText: boolean
  blank: boolean
  ov: ProductOverride
}

export interface ManualPage {
  id: string
  title: string
  gridKey: GridKey
  items: Product[]
}

export interface Cover {
  brand: string
  headline1: string
  headline2: string
  burst: string
  validity: string
}

export interface BannerDef { title: string; sub: string }

export interface Project {
  id: string
  name: string
  store: string
  accent: string
  badge: string
  template: Template
  gridKey: GridKey
  pageSize: PageSize
  dealCount: number
  updated: string
  headline1: string
  headline2: string
  burst: string
}

export interface Selection {
  type: 'product' | 'cover' | 'banner'
  id?: string
}

export interface HistorySnap {
  products: Product[]
  cover: Cover
  banners: Record<string, BannerDef>
  manualPages: ManualPage[]
  pageGrids: Record<number, GridKey>
}
