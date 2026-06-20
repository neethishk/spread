import { create } from 'zustand'
import { supabase } from './lib/supabase'
import { makeProducts, SAMPLE_PROJECTS, DEFAULT_BANNERS, ZOOMS } from './constants'
import { exportPDF } from './utils/pdfExport'
import { exportIDML } from './utils/idmlExport'
import { computeAccent } from './pages/editor/helpers'
import type {
  Screen, Template, GridKey, PageSize, Orientation,
  Product, ManualPage, Cover, BannerDef, Project, Selection,
  HistorySnap, ExportFormat, ExportStage, FreeElement
} from './types'
import type { User } from '@supabase/supabase-js'

interface AppState {
  screen: Screen
  user: User | null
  loggedIn: boolean
  projects: Project[]
  activeProjectId: string | null
  procStep: number
  procCount: number
  products: Product[]
  manualPages: ManualPage[]
  pageGrids: Record<number, GridKey>
  template: Template
  accentKey: string
  customAccent: string
  badge: string
  gridKey: GridKey
  pageSize: PageSize
  orientation: Orientation
  banners: Record<string, BannerDef>
  cover: Cover
  selected: Selection | null
  editingId: { id: string; field: string } | null
  exportOpen: boolean
  exportFormat: ExportFormat
  exportStage: ExportStage
  bleed: boolean
  dragId: string | null
  pageDragId: string | null
  tool: string
  zoom: number
  leftTab: 'deals' | 'pages' | 'elements'
  activePageKey: string
  showRulers: boolean
  showGuides: boolean
  history: HistorySnap[]
  future: HistorySnap[]
  catalogName: string
  _timers: ReturnType<typeof setTimeout>[]
  pageElements: Record<string, FreeElement[]>
  selectedFreeIds: string[]
  freeElPageKey: string | null

  // actions
  initAuth: () => void
  goHome: () => void
  goPricing: () => void
  goSignin: () => void
  goSignup: () => void
  toggleAuthMode: () => void
  doAuth: (email: string, password: string, isSignup: boolean) => Promise<string | null>
  signOut: () => void
  goProjects: () => void
  newProject: () => void
  openProject: (id: string) => void
  loadProjects: () => Promise<void>
  saveProject: () => Promise<void>
  deleteProject: (id: string) => Promise<void>
  startProcessing: () => void
  loadCSV: (products: Product[]) => void
  addDeal: () => void
  addBlank: () => void
  addBlankPage: () => void
  addDealToPage: (mpId: string) => void
  setPageGrid: (pIdx: number, gKey: GridKey) => void
  setManualGrid: (mpId: string, gKey: GridKey) => void
  reorderManualPages: (targetId: string) => void
  removeManualPage: (id: string) => void
  reorder: (targetId: string) => void
  moveProduct: (id: string, dir: -1 | 1) => void
  updateProduct: (id: string, patch: Partial<Product>) => void
  updateOv: (id: string, patch: Partial<Product['ov']>) => void
  liveProduct: (id: string, patch: Partial<Product>) => void
  startEdit: (id: string, field: string) => void
  stopEdit: () => void
  duplicateProduct: (id: string) => void
  removeProduct: (id: string) => void
  record: () => void
  undo: () => void
  redo: () => void
  zoomStep: (dir: 1 | -1) => void
  findAnyProduct: (id: string) => Product | undefined
  generateExport: () => Promise<void>
  addFreeEl: (pageKey: string, el: FreeElement) => void
  updateFreeEl: (pageKey: string, id: string, patch: Partial<FreeElement>) => void
  deleteFreeEls: (pageKey: string, ids: string[]) => void
  duplicateFreeEl: (pageKey: string, id: string) => void
  groupFreeEls: (pageKey: string, ids: string[]) => void
  ungroupFreeEls: (pageKey: string, groupId: string) => void
  set: (patch: Partial<AppState>) => void
}

export const useStore = create<AppState>((set, get) => ({
  screen: 'upload',
  user: null,
  loggedIn: false,
  projects: SAMPLE_PROJECTS,
  activeProjectId: null,
  procStep: 0,
  procCount: 0,
  products: [],
  manualPages: [],
  pageGrids: {},
  template: 'promo',
  accentKey: 'red',
  customAccent: '#0EA5A0',
  badge: '#F7CC3A',
  gridKey: '3x3',
  pageSize: 'a4',
  orientation: 'portrait',
  banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
  cover: { brand: 'GRAND HYPER', headline1: 'WEEKEND', headline2: 'DEALS', burst: 'UP TO 60% OFF', validity: 'VALID 18–24 JUN' },
  selected: null,
  editingId: null,
  exportOpen: false,
  exportFormat: 'pdf',
  exportStage: 'config',
  bleed: true,
  dragId: null,
  pageDragId: null,
  tool: 'select',
  zoom: 1,
  leftTab: 'deals',
  activePageKey: 'cover',
  showRulers: true,
  showGuides: true,
  history: [],
  future: [],
  catalogName: 'Grand Hyper — Weekend Deals',
  _timers: [],
  pageElements: {},
  selectedFreeIds: [],
  freeElPageKey: null,

  set: (patch) => set(patch),

  initAuth: () => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        set({ user: data.session.user, loggedIn: true })
        get().loadProjects()
      }
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, loggedIn: true })
        get().loadProjects()
      } else {
        set({ user: null, loggedIn: false, projects: SAMPLE_PROJECTS })
      }
    })
  },

  goHome: () => set({ screen: 'upload' }),
  goPricing: () => set({ screen: 'pricing' }),
  goSignin: () => set({ screen: 'signin' }),
  goSignup: () => set({ screen: 'signup' }),
  toggleAuthMode: () => set((s) => ({ screen: s.screen === 'signup' ? 'signin' : 'signup' })),

  doAuth: async (email, password, isSignup) => {
    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) return error.message
      set({ loggedIn: true, screen: 'csvUpload' })
      await get().loadProjects()
      return null
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return error.message
      set({ loggedIn: true, screen: 'csvUpload' })
      await get().loadProjects()
      return null
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, loggedIn: false, screen: 'upload', projects: SAMPLE_PROJECTS })
  },

  goProjects: () => {
    get().saveProject()
    set({ screen: 'projects' })
  },

  newProject: () => set({ screen: 'csvUpload', activeProjectId: null }),

  openProject: (id) => {
    const p = get().projects.find((x) => x.id === id)
    if (!p) return
    set({
      screen: 'editor', activeProjectId: id, loggedIn: true,
      catalogName: p.name, template: p.template, gridKey: p.gridKey, pageSize: p.pageSize,
      orientation: 'portrait', accentKey: 'custom', customAccent: p.accent, badge: p.badge,
      products: makeProducts(), manualPages: [], pageGrids: {},
      cover: { brand: p.store, headline1: p.headline1, headline2: p.headline2, burst: p.burst, validity: 'VALID THIS WEEK' },
      banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)),
      selected: null, editingId: null, history: [], future: [], leftTab: 'deals',
    })
  },

  loadProjects: async () => {
    const { data, error } = await supabase.from('projects').select('*').order('updated_at', { ascending: false })
    if (error || !data) return
    const projects: Project[] = data.map((r) => ({
      id: r.id, name: r.name, store: r.store, accent: r.accent, badge: r.badge,
      template: r.template as Template, gridKey: r.grid_key as GridKey, pageSize: r.page_size as PageSize,
      dealCount: (r.products as unknown[]).length, updated: 'Just now',
      headline1: r.headline1, headline2: r.headline2, burst: r.burst,
    }))
    set({ projects })
  },

  saveProject: async () => {
    const s = get()
    const id = s.activeProjectId
    if (!id || !s.user) return
    const accent = s.accentKey === 'custom' ? s.customAccent : (s.accentKey === 'red' ? 'oklch(0.57 0.2 25)' : s.customAccent)
    const payload = {
      name: s.catalogName, store: s.cover.brand, accent, badge: s.badge,
      template: s.template, grid_key: s.gridKey, page_size: s.pageSize, orientation: s.orientation,
      headline1: s.cover.headline1, headline2: s.cover.headline2, burst: s.cover.burst, validity: s.cover.validity,
      products: s.products, manual_pages: s.manualPages, page_grids: s.pageGrids,
      banners: s.banners, cover: s.cover, catalog_name: s.catalogName,
    }
    if (id.startsWith('pr') && id.length < 10) return // sample projects
    await supabase.from('projects').update(payload).eq('id', id)
  },

  deleteProject: async (id) => {
    if (!id.startsWith('pr')) await supabase.from('projects').delete().eq('id', id)
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }))
  },

  startProcessing: () => {
    const s = get()
    const timers = [...s._timers]
    set({ screen: 'processing', procStep: 0, procCount: 0 })
    const total = 32
    let c = 0
    const countT = setInterval(() => {
      c += 2; set({ procCount: Math.min(c, total) })
      if (c >= total) clearInterval(countT)
    }, 110)
    timers.push(countT);
    [700, 1350, 2000, 2600].forEach((t, idx) => timers.push(setTimeout(() => set({ procStep: idx + 1 }), t)))
    timers.push(setTimeout(async () => {
      const user = get().user
      const id = user ? String(Date.now()) : ('pr' + Date.now())
      const np: Project = {
        id, name: 'Untitled catalog', store: 'YOUR STORE', accent: 'oklch(0.57 0.2 25)',
        badge: '#F7CC3A', template: 'promo', gridKey: '3x3', pageSize: 'a4',
        dealCount: 32, updated: 'Just now', headline1: 'WEEKEND', headline2: 'DEALS', burst: 'UP TO 60% OFF',
      }
      if (user) {
        const { data } = await supabase.from('projects').insert({
          user_id: user.id, name: np.name, store: np.store, accent: np.accent, badge: np.badge,
          template: np.template, grid_key: np.gridKey, page_size: np.pageSize, orientation: 'portrait',
          headline1: np.headline1, headline2: np.headline2, burst: np.burst, validity: 'VALID THIS WEEK',
          products: makeProducts(), manual_pages: [], page_grids: {}, banners: DEFAULT_BANNERS,
          cover: { brand: np.store, headline1: np.headline1, headline2: np.headline2, burst: np.burst, validity: 'VALID THIS WEEK' },
          catalog_name: np.name,
        }).select().single()
        if (data) np.id = data.id
      }
      set((s) => ({
        screen: 'editor', loggedIn: true, activeProjectId: np.id, projects: [np, ...s.projects],
        products: makeProducts(), manualPages: [], pageGrids: {}, catalogName: np.name,
        accentKey: 'custom', customAccent: np.accent, badge: np.badge, template: 'promo', gridKey: '3x3', pageSize: 'a4',
        cover: { brand: np.store, headline1: np.headline1, headline2: np.headline2, burst: np.burst, validity: 'VALID THIS WEEK' },
        banners: JSON.parse(JSON.stringify(DEFAULT_BANNERS)), selected: null, history: [], future: [],
      }))
    }, 3400))
    set({ _timers: timers })
  },

  record: () => {
    const s = get()
    const snap: HistorySnap = {
      products: JSON.parse(JSON.stringify(s.products)),
      cover: JSON.parse(JSON.stringify(s.cover)),
      banners: JSON.parse(JSON.stringify(s.banners)),
      manualPages: JSON.parse(JSON.stringify(s.manualPages)),
      pageGrids: { ...s.pageGrids },
    }
    set((s2) => ({ history: [...s2.history, snap].slice(-60), future: [] }))
  },

  undo: () => {
    const s = get()
    if (!s.history.length) return
    const prev = s.history[s.history.length - 1]
    const cur: HistorySnap = {
      products: JSON.parse(JSON.stringify(s.products)),
      cover: JSON.parse(JSON.stringify(s.cover)),
      banners: JSON.parse(JSON.stringify(s.banners)),
      manualPages: JSON.parse(JSON.stringify(s.manualPages)),
      pageGrids: { ...s.pageGrids },
    }
    set({ ...prev, history: s.history.slice(0, -1), future: [cur, ...s.future].slice(0, 60) })
  },

  redo: () => {
    const s = get()
    if (!s.future.length) return
    const next = s.future[0]
    const cur: HistorySnap = {
      products: JSON.parse(JSON.stringify(s.products)),
      cover: JSON.parse(JSON.stringify(s.cover)),
      banners: JSON.parse(JSON.stringify(s.banners)),
      manualPages: JSON.parse(JSON.stringify(s.manualPages)),
      pageGrids: { ...s.pageGrids },
    }
    set({ ...next, future: s.future.slice(1), history: [...s.history, cur].slice(-60) })
  },

  zoomStep: (dir) => {
    const z = get().zoom
    let i = 0; let best = 1e9
    ZOOMS.forEach((v, k) => { const d = Math.abs(v - z); if (d < best) { best = d; i = k } })
    const ni = Math.max(0, Math.min(ZOOMS.length - 1, i + dir))
    set({ zoom: ZOOMS[ni] })
  },

  findAnyProduct: (id) => {
    const s = get()
    let p = s.products.find((x) => x.id === id)
    if (p) return p
    for (const mp of s.manualPages) { p = (mp.items || []).find((x) => x.id === id); if (p) return p }
    return undefined
  },

  reorder: (targetId) => {
    const s = get()
    if (!s.dragId || s.dragId === targetId) return
    const arr = [...s.products]
    const from = arr.findIndex((p) => p.id === s.dragId)
    const to = arr.findIndex((p) => p.id === targetId)
    if (from < 0 || to < 0 || from === to) return
    const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
    set({ products: arr })
  },

  moveProduct: (id, dir) => {
    get().record()
    const s = get()
    const arr = [...s.products]; const i = arr.findIndex((p) => p.id === id)
    if (i >= 0) {
      const j = i + dir; if (j < 0 || j >= arr.length) return
      const [m] = arr.splice(i, 1); arr.splice(j, 0, m); set({ products: arr }); return
    }
    const manualPages = s.manualPages.map((mp) => {
      const k = (mp.items || []).findIndex((p) => p.id === id)
      if (k < 0) return mp
      const items = [...mp.items]; const j = k + dir; if (j < 0 || j >= items.length) return mp
      const [m] = items.splice(k, 1); items.splice(j, 0, m); return { ...mp, items }
    })
    set({ manualPages })
  },

  updateProduct: (id, patch) => {
    get().record()
    set((s) => {
      if (s.products.some((p) => p.id === id))
        return { products: s.products.map((p) => p.id === id ? { ...p, ...patch } : p) }
      return { manualPages: s.manualPages.map((mp) => ({ ...mp, items: mp.items.map((p) => p.id === id ? { ...p, ...patch } : p) })) }
    })
  },

  updateOv: (id, patch) => {
    get().record()
    set((s) => {
      if (s.products.some((p) => p.id === id))
        return { products: s.products.map((p) => p.id === id ? { ...p, ov: { ...p.ov, ...patch } } : p) }
      return { manualPages: s.manualPages.map((mp) => ({ ...mp, items: mp.items.map((p) => p.id === id ? { ...p, ov: { ...p.ov, ...patch } } : p) })) }
    })
  },

  liveProduct: (id, patch) => {
    set((s) => {
      if (s.products.some((p) => p.id === id))
        return { products: s.products.map((p) => p.id === id ? { ...p, ...patch } : p) }
      return { manualPages: s.manualPages.map((mp) => ({ ...mp, items: mp.items.map((p) => p.id === id ? { ...p, ...patch } : p) })) }
    })
  },

  startEdit: (id, field) => {
    get().record()
    set({ editingId: { id, field }, selected: { type: 'product', id } })
  },

  stopEdit: () => set({ editingId: null }),

  duplicateProduct: (id) => {
    get().record()
    set((s) => {
      if (s.products.some((p) => p.id === id)) {
        const i = s.products.findIndex((p) => p.id === id); if (i < 0) return {}
        const copy = { ...s.products[i], id: 'p' + Date.now() }
        const arr = [...s.products]; arr.splice(i + 1, 0, copy)
        return { products: arr, selected: { type: 'product', id: copy.id } }
      }
      let dupId = ''
      const manualPages = s.manualPages.map((mp) => {
        const i = mp.items.findIndex((p) => p.id === id); if (i < 0) return mp
        const copy = { ...mp.items[i], id: 'p' + Date.now() }; dupId = copy.id
        const items = [...mp.items]; items.splice(i + 1, 0, copy)
        return { ...mp, items }
      })
      return { manualPages, selected: { type: 'product', id: dupId } }
    })
  },

  removeProduct: (id) => {
    get().record()
    set((s) => ({
      products: s.products.filter((p) => p.id !== id),
      manualPages: s.manualPages.map((mp) => ({ ...mp, items: mp.items.filter((p) => p.id !== id) })),
      selected: null,
    }))
  },

  addDeal: () => {
    get().record()
    const copy: Product = {
      id: 'p' + Date.now(), name: 'New deal', desc: 'Add a description', category: 'Pantry',
      was: 9.99, now: 6.99, tag: null, align: 'left', text: '',
      showDesc: true, showBadge: true, showImage: true, showTitle: true,
      showPrice: true, showDiscount: true, showText: false, blank: false, ov: {},
    }
    set((s) => ({ products: [...s.products, copy], selected: { type: 'product', id: copy.id }, leftTab: 'deals' }))
  },

  addBlank: () => {
    get().record()
    const copy: Product = {
      id: 'b' + Date.now(), name: '', desc: '', category: 'CUSTOM', was: 0, now: 0, tag: null,
      align: 'left', text: '', showDesc: true, showBadge: false, showImage: true, showTitle: true,
      showPrice: true, showDiscount: false, showText: false, blank: true, ov: {},
    }
    set((s) => ({ products: [...s.products, copy], selected: { type: 'product', id: copy.id }, leftTab: 'deals' }))
  },

  addBlankPage: () => {
    get().record()
    const mp: ManualPage = { id: 'm' + Date.now(), title: 'NEW PAGE', gridKey: get().gridKey, items: [] }
    set((s) => ({ manualPages: [...s.manualPages, mp], leftTab: 'pages' }))
  },

  addDealToPage: (mpId) => {
    get().record()
    const deal: Product = {
      id: 'b' + Date.now() + Math.floor(Math.random() * 999), name: '', desc: '', category: 'CUSTOM',
      was: 0, now: 0, tag: null, align: 'left', text: '',
      showDesc: true, showBadge: false, showImage: true, showTitle: true,
      showPrice: true, showDiscount: false, showText: false, blank: true, ov: {},
    }
    set((s) => ({
      manualPages: s.manualPages.map((mp) => mp.id === mpId ? { ...mp, items: [...mp.items, deal] } : mp),
      selected: { type: 'product', id: deal.id },
    }))
  },

  setPageGrid: (pIdx, gKey) => {
    get().record()
    set((s) => ({ pageGrids: { ...s.pageGrids, [pIdx]: gKey } }))
  },

  setManualGrid: (mpId, gKey) => {
    get().record()
    set((s) => ({ manualPages: s.manualPages.map((mp) => mp.id === mpId ? { ...mp, gridKey: gKey } : mp) }))
  },

  reorderManualPages: (targetId) => {
    const s = get()
    if (!s.pageDragId || s.pageDragId === targetId) return
    const arr = [...s.manualPages]
    const from = arr.findIndex((m) => m.id === s.pageDragId)
    const to = arr.findIndex((m) => m.id === targetId)
    if (from < 0 || to < 0 || from === to) return
    const [m] = arr.splice(from, 1); arr.splice(to, 0, m)
    set({ manualPages: arr })
  },

  removeManualPage: (id) => {
    get().record()
    set((s) => ({ manualPages: s.manualPages.filter((m) => m.id !== id) }))
  },

  loadCSV: (products) => {
    set({
      screen: 'editor',
      products,
      manualPages: [],
      pageGrids: {},
      selected: null,
      editingId: null,
      history: [],
      future: [],
      leftTab: 'deals',
      catalogName: 'My Catalog',
      accentKey: 'red',
      template: 'promo',
      gridKey: products.length > 18 ? '4x4' : products.length > 9 ? '3x3' : '2x2',
    })
  },

  addFreeEl: (pageKey, el) => {
    set((s) => ({
      pageElements: { ...s.pageElements, [pageKey]: [...(s.pageElements[pageKey] ?? []), el] },
      selectedFreeIds: [el.id],
      freeElPageKey: pageKey,
      activePageKey: pageKey,
      tool: 'select',
    }))
  },

  updateFreeEl: (pageKey, id, patch) => {
    set((s) => ({
      pageElements: {
        ...s.pageElements,
        [pageKey]: (s.pageElements[pageKey] ?? []).map((e) => e.id === id ? { ...e, ...patch } : e),
      },
    }))
  },

  deleteFreeEls: (pageKey, ids) => {
    set((s) => ({
      pageElements: {
        ...s.pageElements,
        [pageKey]: (s.pageElements[pageKey] ?? []).filter((e) => !ids.includes(e.id)),
      },
      selectedFreeIds: [],
      freeElPageKey: null,
    }))
  },

  duplicateFreeEl: (pageKey, id) => {
    set((s) => {
      const els = s.pageElements[pageKey] ?? []
      const el = els.find((e) => e.id === id)
      if (!el) return {}
      const copy: FreeElement = { ...el, id: 'fe' + Date.now(), x: Math.min(90, el.x + 3), y: Math.min(90, el.y + 3), zIndex: els.length + 1 }
      return {
        pageElements: { ...s.pageElements, [pageKey]: [...els, copy] },
        selectedFreeIds: [copy.id],
      }
    })
  },

  groupFreeEls: (pageKey, ids) => {
    const groupId = 'g' + Date.now()
    set((s) => ({
      pageElements: {
        ...s.pageElements,
        [pageKey]: (s.pageElements[pageKey] ?? []).map((e) => ids.includes(e.id) ? { ...e, groupId } : e),
      },
    }))
  },

  ungroupFreeEls: (pageKey, groupId) => {
    set((s) => ({
      pageElements: {
        ...s.pageElements,
        [pageKey]: (s.pageElements[pageKey] ?? []).map((e) => e.groupId === groupId ? { ...e, groupId: null } : e),
      },
    }))
  },

  generateExport: async () => {
    const s = get()
    set({ exportStage: 'generating' })
    try {
      if (s.exportFormat === 'pdf') {
        await exportPDF(s.bleed, s.pageSize, s.orientation, (pct) => {
          if (pct === 100) set({ exportStage: 'ready' })
        })
        set({ exportStage: 'ready' })
      } else {
        const ac = computeAccent(s.accentKey, s.customAccent)
        await exportIDML(
          s.products, s.cover, s.banners, s.template, s.gridKey,
          s.pageSize, s.orientation, s.catalogName, ac.color,
        )
        set({ exportStage: 'ready' })
      }
    } catch (e) {
      console.error('Export error:', e)
      set({ exportStage: 'config' })
      alert('Export failed: ' + (e instanceof Error ? e.message : String(e)))
    }
  },
}))
