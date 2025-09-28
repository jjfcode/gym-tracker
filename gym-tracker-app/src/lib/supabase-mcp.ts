/**
 * Enhanced Supabase client with MCP monitoring
 * Wraps Supabase operations to track performance and errors
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseAnonKey = import.meta.env['VITE_SUPABASE_ANON_KEY']

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create base Supabase client
const baseSupabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// MCP-enhanced Supabase wrapper
class MCPSupabaseClient {
  private client = baseSupabase;
  private mcpDashboard: any = null;

  constructor() {
    // Lazy load MCP dashboard to avoid circular dependencies
    if (typeof window !== 'undefined' && import.meta.env.DEV) {
      setTimeout(() => {
        this.mcpDashboard = (window as any).mcpDashboard;
      }, 1000);
    }
  }

  // Wrap Supabase 'from' method to track queries
  from<T extends keyof Database['public']['Tables']>(table: T) {
    const queryBuilder = this.client.from(table);
    
    // Enhanced query builder with MCP tracking
    return new Proxy(queryBuilder, {
      get: (target, prop) => {
        const originalMethod = (target as any)[prop];
        
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        return (...args: any[]) => {
          const startTime = performance.now();
          const operation = String(prop) as 'select' | 'insert' | 'update' | 'delete';
          
          const result = originalMethod.apply(target, args);
          
          // If it's a thenable (Promise-like), wrap it
          if (result && typeof result.then === 'function') {
            return result
              .then((response: any) => {
                const duration = performance.now() - startTime;
                
                // Track successful query
                this.trackQuery({
                  table: String(table),
                  operation,
                  duration,
                  success: !response.error,
                  error: response.error?.message,
                  rowCount: response.data?.length || (response.count !== null ? response.count : undefined)
                });
                
                return response;
              })
              .catch((error: any) => {
                const duration = performance.now() - startTime;
                
                // Track failed query
                this.trackQuery({
                  table: String(table),
                  operation,
                  duration,
                  success: false,
                  error: error.message
                });
                
                throw error;
              });
          }
          
          return result;
        };
      }
    });
  }

  // Track authentication operations
  get auth() {
    const authClient = this.client.auth;
    
    return new Proxy(authClient, {
      get: (target, prop) => {
        const originalMethod = (target as any)[prop];
        
        if (typeof originalMethod !== 'function') {
          return originalMethod;
        }

        return (...args: any[]) => {
          const startTime = performance.now();
          const operation = String(prop);
          
          const result = originalMethod.apply(target, args);
          
          if (result && typeof result.then === 'function') {
            return result
              .then((response: any) => {
                const duration = performance.now() - startTime;
                
                this.trackAuthOperation({
                  operation,
                  duration,
                  success: !response.error,
                  error: response.error?.message
                });
                
                return response;
              })
              .catch((error: any) => {
                const duration = performance.now() - startTime;
                
                this.trackAuthOperation({
                  operation,
                  duration,
                  success: false,
                  error: error.message
                });
                
                throw error;
              });
          }
          
          return result;
        };
      }
    });
  }

  // Track storage operations
  get storage() {
    return this.client.storage;
  }

  // Direct access to realtime
  get realtime() {
    return this.client.realtime;
  }

  // Track database queries
  private trackQuery(queryData: {
    table: string;
    operation: 'select' | 'insert' | 'update' | 'delete';
    duration: number;
    success: boolean;
    error?: string;
    rowCount?: number;
  }) {
    if (this.mcpDashboard?.api?.trackQuery) {
      this.mcpDashboard.api.trackQuery(queryData);
    }
    
    // Also log to console in development
    if (import.meta.env.DEV) {
      const status = queryData.success ? '✅' : '❌';
      const duration = Math.round(queryData.duration);
      const rows = queryData.rowCount !== undefined ? ` (${queryData.rowCount} rows)` : '';
      
      console.log(
        `${status} DB Query: ${queryData.table}.${queryData.operation} - ${duration}ms${rows}`,
        queryData.error ? { error: queryData.error } : ''
      );
    }
  }

  // Track authentication operations
  private trackAuthOperation(authData: {
    operation: string;
    duration: number;
    success: boolean;
    error?: string;
  }) {
    if (this.mcpDashboard?.api?.trackPerformance) {
      this.mcpDashboard.api.trackPerformance(`Auth: ${authData.operation}`, authData.duration);
    }
    
    if (!authData.success && this.mcpDashboard?.api?.trackError) {
      this.mcpDashboard.api.trackError('Authentication', 
        new Error(authData.error || 'Auth operation failed'), 
        { operation: authData.operation }
      );
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      const status = authData.success ? '✅' : '❌';
      const duration = Math.round(authData.duration);
      
      console.log(
        `${status} Auth: ${authData.operation} - ${duration}ms`,
        authData.error ? { error: authData.error } : ''
      );
    }
  }
}

// Create and export the enhanced client
const supabase = new MCPSupabaseClient();

// Test database connection
export const testConnection = async () => {
  try {
    const startTime = performance.now();
    const { error } = await (supabase as any).from('profile').select('count').limit(1);
    const duration = performance.now() - startTime;
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    console.log(`✅ Database connection test completed in ${Math.round(duration)}ms`);
    return { success: true, message: 'Database connection successful' };
  } catch (error) {
    console.error('Database connection failed:', error);
    return { success: false, message: 'Database connection failed', error };
  }
}

export { supabase };
export type { Database };