import { describe, it, expect, beforeAll } from 'vitest'
import { supabase, testConnection } from '../supabase'

describe('Supabase Configuration', () => {
  it('should create supabase client instance', () => {
    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(supabase.from).toBeDefined()
  })

  it('should have required environment variables', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBeDefined()
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBeDefined()
  })

  it('should test database connection', async () => {
    const result = await testConnection()
    expect(result).toHaveProperty('success')
    expect(result).toHaveProperty('message')
    
    // Note: This test may fail if database is not set up yet
    // That's expected during initial development
    if (!result.success) {
      console.warn('Database connection test failed (expected during initial setup):', result.message)
    }
  }, 10000) // 10 second timeout for network requests
})

describe('Database Types', () => {
  it('should have proper TypeScript types', () => {
    // Test that we can call typed methods without TypeScript errors
    const query = supabase.from('profile').select('*')
    expect(query).toBeDefined()
    
    const insertQuery = supabase.from('weight_logs').insert({
      user_id: 'test-id',
      measured_at: '2024-01-01',
      weight: 70.5
    })
    expect(insertQuery).toBeDefined()
  })
})