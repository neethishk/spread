import type { FreeElement } from '../../types'

export interface ComponentTemplate {
  id: string
  label: string
  category: 'Text' | 'Image' | 'Product' | 'Shapes' | 'Backgrounds'
  hint: string
  el: Omit<FreeElement, 'id' | 'zIndex'>
}

export const COMPONENT_CATEGORIES = ['Text', 'Image', 'Product', 'Shapes', 'Backgrounds'] as const
export type ComponentCategory = typeof COMPONENT_CATEGORIES[number]

// Fill color '#ACCENT' is replaced with the current accent color on add
export const ACCENT_PLACEHOLDER = '#ACCENT'

export const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // ── TEXT ────────────────────────────────────────────────────────────
  {
    id: 'section-heading',
    label: 'Heading',
    category: 'Text',
    hint: 'Large bold title text',
    el: {
      type: 'text', x: 5, y: 5, w: 90, h: 9,
      fill: 'transparent', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'SECTION HEADING', text2: '', text3: '',
      fontSize: 38, bold: true, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'subheading',
    label: 'Subheading',
    category: 'Text',
    hint: 'Secondary title text',
    el: {
      type: 'text', x: 5, y: 5, w: 75, h: 6,
      fill: 'transparent', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'Subheading text here', text2: '', text3: '',
      fontSize: 20, bold: false, italic: false, fontColor: '#6B645A', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'body-text',
    label: 'Body Text',
    category: 'Text',
    hint: 'Paragraph body copy',
    el: {
      type: 'text', x: 5, y: 18, w: 90, h: 14,
      fill: 'transparent', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'Add your promotional text here. Terms and conditions apply.', text2: '', text3: '',
      fontSize: 13, bold: false, italic: false, fontColor: '#6B645A', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'callout-box',
    label: 'Callout Box',
    category: 'Text',
    hint: 'Highlighted text container',
    el: {
      type: 'rect', x: 5, y: 5, w: 90, h: 11,
      fill: '#F0ECE3', stroke: '#CFC8BA', strokeW: 1, opacity: 1,
      text: 'Callout message here', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'center',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },

  // ── IMAGE ────────────────────────────────────────────────────────────
  {
    id: 'image-frame',
    label: 'Image Frame',
    category: 'Image',
    hint: 'Image placeholder (URL in inspector)',
    el: {
      type: 'image', x: 5, y: 5, w: 44, h: 36,
      fill: '#F0ECE3', stroke: '#CFC8BA', strokeW: 1, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'image-wide',
    label: 'Wide Image',
    category: 'Image',
    hint: 'Full-width image banner',
    el: {
      type: 'image', x: 0, y: 5, w: 100, h: 45,
      fill: '#F0ECE3', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'image-square',
    label: 'Square Image',
    category: 'Image',
    hint: 'Square product image frame',
    el: {
      type: 'image', x: 25, y: 10, w: 50, h: 42,
      fill: '#F0ECE3', stroke: '#CFC8BA', strokeW: 1, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },

  // ── PRODUCT ──────────────────────────────────────────────────────────
  {
    id: 'brand-header',
    label: 'Brand Header',
    category: 'Product',
    hint: 'Store name + tagline bar',
    el: {
      type: 'brand-header', x: 0, y: 0, w: 100, h: 13,
      fill: '#ACCENT', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'YOUR BRAND', text2: 'WHERE VALUE LIVES', text3: '',
      fontSize: 28, bold: true, italic: false, fontColor: '#FFFFFF', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'logo-band',
    label: 'Logo Band',
    category: 'Product',
    hint: 'Dark strip with logo + year',
    el: {
      type: 'brand-header', x: 0, y: 0, w: 100, h: 9,
      fill: '#211D17', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'LOGO', text2: 'EST. 2024', text3: '',
      fontSize: 22, bold: true, italic: false, fontColor: '#FFFFFF', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'promo-band',
    label: 'Promo Banner',
    category: 'Product',
    hint: 'Bold sale headline band',
    el: {
      type: 'promo-band', x: 0, y: 5, w: 100, h: 22,
      fill: '#ACCENT', stroke: 'none', strokeW: 0, opacity: 1,
      text: 'WEEKEND SALE', text2: 'UP TO 50% OFF', text3: 'VALID THIS WEEK ONLY',
      fontSize: 42, bold: true, italic: false, fontColor: '#FFFFFF', textAlign: 'center',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'savings-badge',
    label: 'Savings Badge',
    category: 'Product',
    hint: 'Circular % discount sticker',
    el: {
      type: 'badge', x: 72, y: 4, w: 22, h: 20,
      fill: '#F7CC3A', stroke: 'none', strokeW: 0, opacity: 1,
      text: '50', text2: '%', text3: 'SAVE',
      fontSize: 46, bold: true, italic: false, fontColor: '#211D17', textAlign: 'center',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'points-badge',
    label: 'Points Badge',
    category: 'Product',
    hint: 'Loyalty points circular badge',
    el: {
      type: 'sticker', x: 72, y: 4, w: 22, h: 20,
      fill: '#7C3AED', stroke: 'none', strokeW: 0, opacity: 1,
      text: '800', text2: 'POINTS', text3: '',
      fontSize: 38, bold: true, italic: false, fontColor: '#FFFFFF', textAlign: 'center',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'price-tag',
    label: 'Price Tag',
    category: 'Product',
    hint: 'Was / Now price display',
    el: {
      type: 'price-tag', x: 5, y: 30, w: 42, h: 22,
      fill: '#FFFFFF', stroke: '#211D17', strokeW: 2, opacity: 1,
      text: '12.99', text2: 'WAS 18.99', text3: 'AED',
      fontSize: 52, bold: true, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'sale-sticker',
    label: 'Sale Sticker',
    category: 'Product',
    hint: 'Custom round sticker',
    el: {
      type: 'sticker', x: 72, y: 4, w: 22, h: 20,
      fill: '#ACCENT', stroke: '#fff', strokeW: 2, opacity: 1,
      text: 'SALE', text2: 'NOW ON', text3: '',
      fontSize: 28, bold: true, italic: false, fontColor: '#FFFFFF', textAlign: 'center',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },

  // ── SHAPES ──────────────────────────────────────────────────────────────
  {
    id: 'divider',
    label: 'Divider',
    category: 'Shapes',
    hint: 'Horizontal separator line',
    el: {
      type: 'rect', x: 5, y: 48, w: 90, h: 0.6,
      fill: '#CFC8BA', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    category: 'Shapes',
    hint: 'Basic rectangle shape',
    el: {
      type: 'rect', x: 20, y: 20, w: 60, h: 28,
      fill: '#E4DFD5', stroke: '#211D17', strokeW: 1, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    category: 'Shapes',
    hint: 'Circle or oval shape',
    el: {
      type: 'ellipse', x: 30, y: 20, w: 40, h: 24,
      fill: '#E4DFD5', stroke: '#211D17', strokeW: 1, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 16, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },

  // ── BACKGROUNDS ──────────────────────────────────────────────────────────
  {
    id: 'bg-white',
    label: 'White',
    category: 'Backgrounds',
    hint: 'White page background',
    el: {
      type: 'rect', x: 0, y: 0, w: 100, h: 100,
      fill: '#FFFFFF', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'bg-cream',
    label: 'Cream',
    category: 'Backgrounds',
    hint: 'Warm cream page background',
    el: {
      type: 'rect', x: 0, y: 0, w: 100, h: 100,
      fill: '#FBF6EC', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'bg-dark',
    label: 'Dark',
    category: 'Backgrounds',
    hint: 'Dark page background',
    el: {
      type: 'rect', x: 0, y: 0, w: 100, h: 100,
      fill: '#211D17', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#FFFFFF', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'bg-accent',
    label: 'Accent',
    category: 'Backgrounds',
    hint: 'Accent color page background',
    el: {
      type: 'rect', x: 0, y: 0, w: 100, h: 100,
      fill: '#ACCENT', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#FFFFFF', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
  {
    id: 'bg-image',
    label: 'Photo BG',
    category: 'Backgrounds',
    hint: 'Full-page photo background',
    el: {
      type: 'image', x: 0, y: 0, w: 100, h: 100,
      fill: '#F0ECE3', stroke: 'none', strokeW: 0, opacity: 1,
      text: '', text2: '', text3: '',
      fontSize: 14, bold: false, italic: false, fontColor: '#211D17', textAlign: 'left',
      imageUrl: '', fit: 'cover', groupId: null,
    },
  },
]
