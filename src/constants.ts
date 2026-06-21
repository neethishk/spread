import type { Template, GridKey, PageSize, BannerDef, Product } from './types'

export const ACCENTS: Record<string, { name: string; color: string; soft: string; border: string }> = {
  red:     { name: 'Hyper Red',  color: 'oklch(0.57 0.2 25)',  soft: 'oklch(0.95 0.04 25)',  border: 'oklch(0.85 0.07 25)' },
  orange:  { name: 'Orange',     color: 'oklch(0.65 0.18 50)',  soft: 'oklch(0.96 0.05 50)',  border: 'oklch(0.86 0.08 50)' },
  magenta: { name: 'Magenta',    color: 'oklch(0.55 0.21 358)', soft: 'oklch(0.95 0.05 358)', border: 'oklch(0.85 0.08 358)' },
  green:   { name: 'Fresh',      color: 'oklch(0.52 0.14 152)', soft: 'oklch(0.95 0.04 152)', border: 'oklch(0.84 0.07 152)' },
  blue:    { name: 'Cool Blue',  color: 'oklch(0.5 0.16 252)',  soft: 'oklch(0.95 0.04 252)', border: 'oklch(0.84 0.07 252)' },
  purple:  { name: 'Purple',     color: 'oklch(0.5 0.18 300)',  soft: 'oklch(0.95 0.04 300)', border: 'oklch(0.84 0.07 300)' },
}

export const PALETTES = [
  { key: 'classic',  name: 'Hyper Classic', accent: 'oklch(0.57 0.2 25)',   badge: '#F7CC3A' },
  { key: 'sunset',   name: 'Sunset',        accent: 'oklch(0.65 0.18 50)',   badge: '#F4BF3F' },
  { key: 'orchard',  name: 'Orchard',       accent: 'oklch(0.52 0.14 152)',  badge: '#F7CC3A' },
  { key: 'cobalt',   name: 'Cobalt',        accent: 'oklch(0.5 0.16 252)',   badge: '#EFB146' },
  { key: 'berry',    name: 'Berry',         accent: 'oklch(0.55 0.21 358)',  badge: '#F5C83C' },
  { key: 'midnight', name: 'Midnight',      accent: 'oklch(0.42 0.12 280)',  badge: '#E4C226' },
]

export const PRICING_TIERS = [
  { key: 'starter', name: 'Starter', price: '$0',  per: '/forever', tagline: 'For your first flyer.', cta: 'Start free', highlight: false, features: ['1 active project', 'Up to 2 pages', 'CSV & Excel import', 'PDF export (watermarked)', 'Community templates'] },
  { key: 'studio',  name: 'Studio',  price: '$29', per: '/month',   tagline: 'For busy retail teams.', cta: 'Start 14-day trial', highlight: true, features: ['Unlimited projects', 'Unlimited pages', 'Print-ready PDF, no watermark', 'InDesign export', 'All premium templates', 'Custom brand palettes'] },
  { key: 'chain',   name: 'Chain',   price: '$99', per: '/month',   tagline: 'For multi-store chains.', cta: 'Talk to sales', highlight: false, features: ['Everything in Studio', 'Shopify & PIM live sync', 'Multi-store catalogs', 'Shared brand kit & roles', 'Priority support', 'SSO & audit log'] },
]

export const TAGCOL: Record<string, string> = {
  green: '#1C8742',
  violet: '#8951C0',
  blue: '#0069C1',
}

export const SIZES: Record<PageSize, { label: string; long: number; ratio: number }> = {
  a5:     { label: 'A5',        long: 540, ratio: 1.414 },
  a4:     { label: 'A4',        long: 700, ratio: 1.414 },
  a3:     { label: 'A3',        long: 860, ratio: 1.414 },
  letter: { label: 'US Letter', long: 700, ratio: 1.294 },
  square: { label: 'Square',    long: 580, ratio: 1.0 },
}

export const GRIDS: Record<GridKey, { cols: number; rows: number }> = {
  '2x2': { cols: 2, rows: 2 }, '2x3': { cols: 2, rows: 3 }, '3x3': { cols: 3, rows: 3 },
  '3x4': { cols: 3, rows: 4 }, '4x4': { cols: 4, rows: 4 },
}

export const DEFAULT_BANNERS: Record<Template, BannerDef> = {
  promo:  { title: 'WEEKEND DEALS',        sub: 'EVERYDAY LOW PRICES' },
  mega:   { title: 'MEGA SAVERS',          sub: 'OUR LOWEST PRICES' },
  clean:  { title: 'LOW PRICES · BIG SAVINGS', sub: 'FRESH PICKS' },
  bomb:   { title: 'PRICE DROP',           sub: 'LIMITED TIME ONLY' },
  spec:   { title: 'BIG-TICKET BUYS',      sub: '0% EMI AVAILABLE' },
  custom: { title: 'YOUR SECTION',         sub: 'CUSTOM LAYOUT' },
  dark:   { title: 'NIGHT DEALS',          sub: 'EXCLUSIVE OFFERS' },
  neo:    { title: 'NEW ARRIVALS',         sub: 'SHARP PRICES' },
  pop:    { title: 'FLASH SALE',           sub: 'TODAY ONLY' },
}

export const CATALOG_THEMES = [
  { key: 'weekend',  name: 'Weekend Deals',   headline1: 'WEEKEND',   headline2: 'DEALS',   burst: 'UP TO 60% OFF', bannerTitle: 'WEEKEND DEALS' },
  { key: 'summer',   name: 'Summer Deals',    headline1: 'SUMMER',    headline2: 'DEALS',   burst: 'HOT SAVINGS',   bannerTitle: 'SUMMER SAVERS' },
  { key: 'school',   name: 'Back to School',  headline1: 'BACK TO',   headline2: 'SCHOOL',  burst: 'GREAT VALUE',   bannerTitle: 'BACK TO SCHOOL' },
  { key: 'ramadan',  name: 'Ramadan Specials',headline1: 'RAMADAN',   headline2: 'SPECIALS',burst: 'SAVE BIG',      bannerTitle: 'RAMADAN SPECIALS' },
  { key: 'friday',   name: 'Black Friday',    headline1: 'BLACK',     headline2: 'FRIDAY',  burst: '0% EMI',        bannerTitle: 'BLACK FRIDAY' },
  { key: 'payday',   name: 'Payday Savers',   headline1: 'PAYDAY',    headline2: 'SAVERS',  burst: 'EXTRA 10% OFF', bannerTitle: 'PAYDAY PICKS' },
] as const

export const TPL_DEFS = [
  { key: 'promo',  name: 'Promo Grid',  desc: 'Clean deal cells' },
  { key: 'mega',   name: 'Mega Saver',  desc: 'Bold accent-bar cells' },
  { key: 'clean',  name: 'Low Price',   desc: 'Minimal, plain prices' },
  { key: 'bomb',   name: 'Price Drop',  desc: 'Tinted, price-forward' },
  { key: 'spec',   name: 'Big-Ticket',  desc: 'Specs + finance chips' },
  { key: 'dark',   name: 'Night Mode',  desc: 'Dark cells, high contrast' },
  { key: 'neo',    name: 'Neo Bold',    desc: 'Sharp corners, strong borders' },
  { key: 'pop',    name: 'Pop & Flash', desc: 'Tinted + stripe, high energy' },
  { key: 'custom', name: 'Custom',      desc: 'Style each cell yourself' },
] as const

export const TOOL_DEFS = [
  { k: 'select',  g: '↖', n: 'Selection (V)' },
  { k: 'type',    g: 'T',  n: 'Type (T)' },
  { k: 'image',   g: '⊞', n: 'Image frame (F)' },
  { k: 'rect',    g: '▭', n: 'Rectangle (M)' },
  { k: 'ellipse', g: '◯', n: 'Ellipse (L)' },
  { k: 'hand',    g: '✥', n: 'Hand (H)' },
  { k: 'zoom',    g: '⌕', n: 'Zoom (Z)' },
]

export const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2]

export const RAW_PRODUCTS: Omit<Product, 'id' | 'ov' | 'align' | 'text' | 'showDesc' | 'showBadge' | 'showImage' | 'showTitle' | 'showPrice' | 'showDiscount' | 'showText' | 'blank'>[] = [
  { name: 'Sunflower Cooking Oil 1.8L', desc: 'Heart-healthy · Bottle', category: 'Pantry',      was: 5.95,  now: 3.50,  tag: null },
  { name: 'Golden Basmati Rice 5kg',    desc: 'Aged premium grain',     category: 'Pantry',      was: 12.90, now: 8.95,  tag: null },
  { name: 'Extra Virgin Olive Oil 750ml',desc:'Cold pressed',           category: 'Pantry',      was: 15.00, now: 9.90,  tag: null },
  { name: 'Penne Pasta 1kg',            desc: 'Durum wheat',            category: 'Pantry',      was: 3.20,  now: 1.95,  tag: null },
  { name: 'Canned Tomatoes 4 × 400g',   desc: 'Italian peeled',        category: 'Pantry',      was: 6.40,  now: 3.95,  tag: null },
  { name: 'Fresh Whole Chicken',         desc: 'Per kg · Farm fresh',   category: 'Fresh',       was: 4.20,  now: 2.75,  tag: { t: 'FRESH', col: 'green' } },
  { name: 'Atlantic Salmon Fillet',      desc: 'Per kg · Skin-on',      category: 'Fresh',       was: 18.90, now: 13.50, tag: null },
  { name: 'Beef Mince 1kg',             desc: 'Lean · 90/10',           category: 'Fresh',       was: 9.50,  now: 6.95,  tag: null },
  { name: 'Cavendish Bananas 1kg',       desc: 'Ecuador · Per kg',      category: 'Produce',     was: 1.30,  now: 0.85,  tag: { t: '800 pts', col: 'violet' } },
  { name: 'Hass Avocado 4pk',           desc: 'Ready to eat',           category: 'Produce',     was: 5.60,  now: 3.40,  tag: null },
  { name: 'Vine Tomatoes 1kg',          desc: 'Greenhouse grown',        category: 'Produce',     was: 2.80,  now: 1.75,  tag: null },
  { name: 'Greek Yogurt 6 × 150g',      desc: 'High protein',           category: 'Dairy',       was: 6.50,  now: 4.25,  tag: null },
  { name: 'Mature Cheddar 500g',        desc: 'Block · Aged 12mo',       category: 'Dairy',       was: 8.90,  now: 5.95,  tag: null },
  { name: 'Fresh Milk 2L',             desc: 'Full cream',              category: 'Dairy',       was: 3.40,  now: 2.50,  tag: null },
  { name: 'Power Clean Detergent 4L',   desc: 'Front & top load',       category: 'Home',        was: 18.95, now: 11.50, tag: null },
  { name: 'Soft Facial Tissue 6pk',     desc: '2-ply · 150 sheets',     category: 'Home',        was: 9.00,  now: 5.95,  tag: null },
  { name: 'Lemon Dish Soap 1L',         desc: 'Tough on grease',        category: 'Home',        was: 5.40,  now: 2.95,  tag: { t: '+ FREE sponge', col: 'green' } },
  { name: 'Kitchen Paper Towels 8pk',   desc: 'Extra absorbent',        category: 'Home',        was: 11.90, now: 7.50,  tag: null },
  { name: 'Heavy-Duty Trash Bags 60ct', desc: 'Drawstring',             category: 'Home',        was: 8.20,  now: 4.95,  tag: null },
  { name: 'Gold Roast Instant Coffee 200g', desc: '100% Arabica',       category: 'Beverages',   was: 24.50, now: 16.90, tag: null },
  { name: 'Classic Cola 6 × 330ml',    desc: 'Multipack cans',          category: 'Beverages',   was: 7.95,  now: 4.50,  tag: null },
  { name: 'Orange Juice 2L',           desc: 'Not from concentrate',    category: 'Beverages',   was: 6.20,  now: 3.95,  tag: null },
  { name: 'Green Tea 100 bags',        desc: 'Antioxidant rich',        category: 'Beverages',   was: 9.40,  now: 5.90,  tag: null },
  { name: 'Roasted Mixed Nuts 500g',   desc: 'Unsalted · Resealable',   category: 'Snacks',      was: 13.95, now: 8.50,  tag: null },
  { name: 'Sea Salt Potato Chips 6pk', desc: 'Sharing size',            category: 'Snacks',      was: 7.80,  now: 4.25,  tag: null },
  { name: 'Dark Chocolate 200g',       desc: '70% cocoa',               category: 'Snacks',      was: 5.50,  now: 3.20,  tag: null },
  { name: 'Nourish Shampoo 750ml',     desc: 'For all hair types',      category: 'Beauty',      was: 14.90, now: 8.95,  tag: null },
  { name: 'Silk Body Wash 1L',         desc: 'Moisturising',            category: 'Beauty',      was: 11.50, now: 6.90,  tag: null },
  { name: '55" 4K Smart QLED TV',      desc: 'Dolby Vision · 144Hz',   category: 'Electronics', was: 2899,  now: 2299,  tag: { t: 'BESTSELLER', col: 'blue' } },
  { name: 'Digital Air Fryer 6L',      desc: 'Rapid hot-air',           category: 'Electronics', was: 320,   now: 199,   tag: null },
  { name: 'Robot Vacuum + Mop',        desc: 'LiDAR mapping',           category: 'Electronics', was: 1599,  now: 1099,  tag: { t: 'NEW', col: 'blue' } },
  { name: 'Mega Diapers Pack 120ct',   desc: 'Size 4 · 9–14kg',        category: 'Baby',        was: 22.90, now: 14.95, tag: null },
]

export function makeProducts(): Product[] {
  return RAW_PRODUCTS.map((r, i) => ({
    id: 'p' + i,
    name: r.name, desc: r.desc, category: r.category, was: r.was, now: r.now, tag: r.tag,
    align: 'left', text: '',
    showDesc: true, showBadge: true, showImage: true, showTitle: true,
    showPrice: true, showDiscount: true, showText: false,
    blank: false, ov: {},
  }))
}

export const SAMPLE_PROJECTS = [
  { id: 'pr1', name: 'Grand Hyper — Weekend Deals', store: 'GRAND HYPER', accent: 'oklch(0.57 0.2 25)',  badge: 'oklch(0.86 0.16 92)', template: 'promo' as Template, gridKey: '3x3' as GridKey, pageSize: 'a4' as PageSize, dealCount: 32, updated: 'Edited 2h ago',   headline1: 'WEEKEND', headline2: 'DEALS',   burst: 'UP TO 60% OFF' },
  { id: 'pr2', name: 'FreshMart — Ramadan Specials', store: 'FRESHMART', accent: 'oklch(0.52 0.14 152)', badge: 'oklch(0.86 0.16 92)', template: 'mega'  as Template, gridKey: '3x4' as GridKey, pageSize: 'a4' as PageSize, dealCount: 32, updated: 'Edited yesterday', headline1: 'RAMADAN',headline2: 'SPECIALS', burst: 'SAVE BIG' },
  { id: 'pr3', name: 'TechZone — Black Friday',      store: 'TECHZONE',  accent: 'oklch(0.5 0.16 252)',  badge: 'oklch(0.8 0.14 78)',  template: 'spec'  as Template, gridKey: '2x3' as GridKey, pageSize: 'a4' as PageSize, dealCount: 32, updated: 'Edited 3d ago',   headline1: 'BLACK',  headline2: 'FRIDAY',  burst: '0% EMI' },
]

export function stripeBg() {
  return 'repeating-linear-gradient(135deg,#F3F1EC,#F3F1EC 11px,#EDEAE3 11px,#EDEAE3 22px)'
}

export function money(n: number) {
  return '$' + Number(n).toFixed(2)
}

export function ring(active: boolean, color: string) {
  return active ? '0 0 0 2px ' + color : '0 0 0 1px #EAE6DD'
}

export function swX(on: boolean) { return on ? '18px' : '2px' }
