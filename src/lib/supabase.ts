import { createClient } from '@supabase/supabase-js'

// Эти значения нужно будет заменить на реальные
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Типы для базы данных
export interface CJMProject {
  id: string
  created_at: string
  updated_at: string
  title: string
  type: 'cjm' | 'business_canvas' | 'lean_canvas'
  data: any
  user_id?: string
}
