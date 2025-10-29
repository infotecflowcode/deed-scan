import { createClient } from '@supabase/supabase-js'
import type { Database } from './types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tiufkakigpzihtpxklis.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdWZrYWtpZ3B6aWh0cHhrbGlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMTA1NTMsImV4cCI6MjA3NjY4NjU1M30.srcIVIllnckUS94QOT_0BYe1AOLUorex1GUP9C1o_hs'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables:', {
    url: supabaseUrl,
    key: supabaseAnonKey ? 'present' : 'missing'
  })
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)