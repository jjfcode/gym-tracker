#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import { databaseIndexes } from '../src/lib/database-optimization';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:');
  console.error('- VITE_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createIndexes() {
  console.log('🔧 Creating database indexes...');
  
  for (const [index, sql] of databaseIndexes.indexes.entries()) {
    try {
      console.log(`Creating index ${index + 1}/${databaseIndexes.indexes.length}...`);
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Failed to create index: ${error.message}`);
      } else {
        console.log(`✅ Index created successfully`);
      }
    } catch (error) {
      console.error(`❌ Error creating index:`, error);
    }
  }
}

async function createFunctions() {
  console.log('🔧 Creating database functions...');
  
  for (const [funcIndex, sql] of databaseIndexes.functions.entries()) {
    try {
      console.log(`Creating function ${funcIndex + 1}/${databaseIndexes.functions.length}...`);
      const { error } = await supabase.rpc('exec_sql', { sql });
      
      if (error) {
        console.error(`❌ Failed to create function: ${error.message}`);
      } else {
        console.log(`✅ Function created successfully`);
      }
    } catch (error) {
      console.error(`❌ Error creating function:`, error);
    }
  }
}

async function analyzeTableStats() {
  console.log('📊 Analyzing table statistics...');
  
  const tables = ['workouts', 'exercises', 'exercise_sets', 'weight_logs', 'profile', 'plans'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error(`❌ Failed to analyze ${table}: ${error.message}`);
      } else {
        console.log(`📋 ${table}: ${data?.length || 0} rows`);
      }
    } catch (error) {
      console.error(`❌ Error analyzing ${table}:`, error);
    }
  }
}

async function checkIndexUsage() {
  console.log('🔍 Checking index usage...');
  
  try {
    // This would require custom SQL to check index usage statistics
    // For now, we'll just verify that indexes exist
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname LIKE 'idx_%'
        ORDER BY tablename, indexname;
      `
    });
    
    if (error) {
      console.error('❌ Failed to check indexes:', error.message);
    } else {
      console.log(`✅ Found ${data?.length || 0} custom indexes`);
      if (data && data.length > 0) {
        data.forEach((index: any) => {
          console.log(`  - ${index.tablename}.${index.indexname}`);
        });
      }
    }
  } catch (error) {
    console.error('❌ Error checking indexes:', error);
  }
}

async function optimizeDatabase() {
  console.log('🚀 Starting database optimization...');
  console.log('');
  
  try {
    await analyzeTableStats();
    console.log('');
    
    await createIndexes();
    console.log('');
    
    await createFunctions();
    console.log('');
    
    await checkIndexUsage();
    console.log('');
    
    console.log('✅ Database optimization completed successfully!');
    console.log('');
    console.log('📝 Recommendations:');
    console.log('- Monitor query performance using the QueryPerformanceMonitor');
    console.log('- Run ANALYZE on tables after significant data changes');
    console.log('- Consider partitioning large tables if they grow beyond 1M rows');
    console.log('- Review and update statistics regularly');
    
  } catch (error) {
    console.error('❌ Database optimization failed:', error);
    process.exit(1);
  }
}

// Run the optimization
optimizeDatabase();