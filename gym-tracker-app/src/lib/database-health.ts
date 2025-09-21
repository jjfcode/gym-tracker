import { supabase } from './supabase'

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy'
  checks: {
    connection: boolean
    authentication: boolean
    tables: boolean
    rls: boolean
  }
  message: string
  timestamp: string
}

export async function performHealthCheck(): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString()
  const checks = {
    connection: false,
    authentication: false,
    tables: false,
    rls: false
  }

  try {
    // Test 1: Basic connection
    const { error: connectionError } = await supabase
      .from('profile')
      .select('count')
      .limit(1)
    
    checks.connection = !connectionError || 
      connectionError.code === 'PGRST116' || // No rows (OK)
      connectionError.code === 'PGRST301'    // RLS violation (OK, means RLS is working)

    // Test 2: Authentication service
    try {
      const { data: { session } } = await supabase.auth.getSession()
      checks.authentication = true // Auth service is responding
    } catch (error) {
      checks.authentication = false
    }

    // Test 3: Tables exist
    const tables = ['profile', 'weight_logs', 'plans', 'workouts', 'exercises', 'exercise_sets']
    const tableChecks = await Promise.allSettled(
      tables.map(table => 
        supabase.from(table).select('count').limit(1)
      )
    )
    
    checks.tables = tableChecks.every(result => 
      result.status === 'fulfilled' && (
        !result.value.error ||
        result.value.error.code === 'PGRST116' ||
        result.value.error.code === 'PGRST301'
      )
    )

    // Test 4: RLS is working (should get permission denied without auth)
    const { error: rlsError } = await supabase
      .from('profile')
      .select('*')
      .limit(1)
    
    checks.rls = rlsError?.code === 'PGRST301' || 
      rlsError?.message?.includes('row-level security')

    // Determine overall status
    const healthyChecks = Object.values(checks).filter(Boolean).length
    let status: HealthCheckResult['status']
    let message: string

    if (healthyChecks === 4) {
      status = 'healthy'
      message = 'All systems operational'
    } else if (healthyChecks >= 2) {
      status = 'degraded'
      message = `${healthyChecks}/4 checks passing - some issues detected`
    } else {
      status = 'unhealthy'
      message = `${healthyChecks}/4 checks passing - significant issues detected`
    }

    return {
      status,
      checks,
      message,
      timestamp
    }

  } catch (error) {
    return {
      status: 'unhealthy',
      checks,
      message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp
    }
  }
}

export function printHealthCheck(result: HealthCheckResult) {
  const statusEmoji = {
    healthy: '🟢',
    degraded: '🟡', 
    unhealthy: '🔴'
  }

  console.log(`\n${statusEmoji[result.status]} Database Health Check`)
  console.log('================================')
  console.log(`Status: ${result.status.toUpperCase()}`)
  console.log(`Message: ${result.message}`)
  console.log(`Timestamp: ${result.timestamp}`)
  console.log('\nDetailed Checks:')
  console.log(`- Connection: ${result.checks.connection ? '✅' : '❌'}`)
  console.log(`- Authentication: ${result.checks.authentication ? '✅' : '❌'}`)
  console.log(`- Tables: ${result.checks.tables ? '✅' : '❌'}`)
  console.log(`- RLS Security: ${result.checks.rls ? '✅' : '❌'}`)
  console.log('')
}

// Utility for continuous monitoring during development
export function startHealthMonitoring(intervalMs: number = 30000) {
  console.log('🔍 Starting database health monitoring...')
  
  const monitor = async () => {
    const result = await performHealthCheck()
    if (result.status !== 'healthy') {
      printHealthCheck(result)
    }
  }

  // Initial check
  monitor()
  
  // Set up interval
  const interval = setInterval(monitor, intervalMs)
  
  return () => {
    clearInterval(interval)
    console.log('🛑 Database health monitoring stopped')
  }
}