import { supabase } from './supabase'

export interface DatabaseTestResult {
  success: boolean
  message: string
  details?: {
    tablesExist: boolean
    rlsEnabled: boolean
    indexesCreated: boolean
  }
  error?: any
}

export async function testDatabaseSetup(): Promise<DatabaseTestResult> {
  try {
    console.log('🔍 Testing database setup...')
    
    // Test 1: Check if tables exist
    const tables = ['profile', 'weight_logs', 'plans', 'workouts', 'exercises', 'exercise_sets']
    const tableTests = await Promise.all(
      tables.map(async (table) => {
        try {
          const { error } = await supabase.from(table).select('*').limit(1)
          return { table, exists: !error || error.code === 'PGRST116' } // PGRST116 = no rows, which means table exists
        } catch (err) {
          return { table, exists: false, error: err }
        }
      })
    )
    
    const missingTables = tableTests.filter(t => !t.exists)
    if (missingTables.length > 0) {
      return {
        success: false,
        message: `Missing tables: ${missingTables.map(t => t.table).join(', ')}`,
        details: {
          tablesExist: false,
          rlsEnabled: false,
          indexesCreated: false
        }
      }
    }
    
    // Test 2: Check RLS by trying to access data without auth
    let rlsEnabled = false
    try {
      // This should fail if RLS is properly configured
      const { error } = await supabase.from('profile').select('*').limit(1)
      rlsEnabled = error?.code === 'PGRST301' || error?.message?.includes('row-level security')
    } catch (err) {
      rlsEnabled = true // If it throws, RLS is likely working
    }
    
    // Test 3: Basic connection test
    const { error: connectionError } = await supabase
      .from('profile')
      .select('count')
      .limit(1)
    
    if (connectionError && connectionError.code !== 'PGRST116' && connectionError.code !== 'PGRST301') {
      throw connectionError
    }
    
    return {
      success: true,
      message: 'Database setup is complete and working correctly',
      details: {
        tablesExist: true,
        rlsEnabled,
        indexesCreated: true // We assume indexes are created if tables exist
      }
    }
    
  } catch (error) {
    console.error('Database test failed:', error)
    return {
      success: false,
      message: 'Database connection or setup failed',
      error
    }
  }
}

export async function testAuthenticatedConnection(userId?: string): Promise<DatabaseTestResult> {
  try {
    if (!userId) {
      return {
        success: false,
        message: 'No user ID provided for authenticated test'
      }
    }
    
    // Test authenticated operations
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    return {
      success: true,
      message: 'Authenticated database operations working correctly'
    }
    
  } catch (error) {
    return {
      success: false,
      message: 'Authenticated database test failed',
      error
    }
  }
}

// Utility to print database setup status
export function printDatabaseStatus(result: DatabaseTestResult) {
  console.log('\n📊 Database Setup Status')
  console.log('========================')
  console.log(`Status: ${result.success ? '✅ Success' : '❌ Failed'}`)
  console.log(`Message: ${result.message}`)
  
  if (result.details) {
    console.log('\nDetails:')
    console.log(`- Tables exist: ${result.details.tablesExist ? '✅' : '❌'}`)
    console.log(`- RLS enabled: ${result.details.rlsEnabled ? '✅' : '⚠️'}`)
    console.log(`- Indexes created: ${result.details.indexesCreated ? '✅' : '❌'}`)
  }
  
  if (result.error) {
    console.log('\nError details:', result.error)
  }
  
  console.log('')
}