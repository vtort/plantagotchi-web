import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vyfhihrjhfbgcdghapao.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5ZmhpaHJqaGZiZ2NkZ2hhcGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0Mzk0NzMsImV4cCI6MjA5NzAxNTQ3M30.yFN6P0luc3rvBMCN3wU-SO2hyPCBhCFhWM3IvllmoN4'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export type Reading = {
  id: number
  created_at: string
  lux: number
  temperature: number
  pressure: number
  soil_raw: number
  soil_pct: number
  state: string
}
