import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profile').select('count').limit(1)
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" which is OK for empty table
      throw error
    }
    return { success: true, message: 'Database connection successful' }
  } catch (error) {
    console.error('Database connection failed:', error)
    return { success: false, message: 'Database connection failed', error }
  }
}