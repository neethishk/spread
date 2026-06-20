import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          store: string
          accent: string
          badge: string
          template: string
          grid_key: string
          page_size: string
          orientation: string
          headline1: string
          headline2: string
          burst: string
          validity: string
          products: unknown[]
          manual_pages: unknown[]
          page_grids: Record<string, string>
          banners: Record<string, { title: string; sub: string }>
          cover: Record<string, string>
          catalog_name: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
    }
  }
}
