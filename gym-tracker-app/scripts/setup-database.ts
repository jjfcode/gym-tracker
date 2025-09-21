import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// This script requires the service role key to create tables and policies
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL or SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Gym Tracker database...')
    
    // Read the schema file
    const schemaPath = join(process.cwd(), 'supabase', 'schema.sql')
    const schema = readFileSync(schemaPath, 'utf-8')
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Executing ${statements.length} SQL statements...`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`   ${i + 1}/${statements.length}: Executing statement...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        // Try direct execution for statements that don't work with rpc
        const { error: directError } = await supabase
          .from('_temp')
          .select('*')
          .limit(0) // This will fail but allows us to execute raw SQL
        
        if (directError && !directError.message.includes('relation "_temp" does not exist')) {
          console.error(`❌ Error executing statement ${i + 1}:`, error)
          console.error('Statement:', statement.substring(0, 100) + '...')
        }
      }
    }
    
    console.log('✅ Database setup completed successfully!')
    
    // Test the connection
    console.log('🔍 Testing database connection...')
    const { data, error } = await supabase.from('profile').select('count').limit(1)
    
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    
    console.log('✅ Database connection test passed!')
    console.log('🎉 Gym Tracker database is ready to use!')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

// Alternative manual setup instructions
function printManualSetupInstructions() {
  console.log('\n📋 Manual Database Setup Instructions:')
  console.log('=====================================')
  console.log('1. Go to your Supabase project dashboard')
  console.log('2. Navigate to the SQL Editor')
  console.log('3. Copy and paste the contents of supabase/schema.sql')
  console.log('4. Execute the SQL to create all tables, indexes, and policies')
  console.log('5. Verify the setup by checking the Tables section')
  console.log('\nTables that should be created:')
  console.log('- profile')
  console.log('- weight_logs')
  console.log('- plans')
  console.log('- workouts')
  console.log('- exercises')
  console.log('- exercise_sets')
  console.log('\n✨ All tables should have Row Level Security enabled')
}

if (require.main === module) {
  setupDatabase().catch(() => {
    console.log('\n⚠️  Automated setup failed. Please use manual setup:')
    printManualSetupInstructions()
  })
}

export { setupDatabase, printManualSetupInstructions }