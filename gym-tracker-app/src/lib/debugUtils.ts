/**
 * Enhanced debugging utilities for chrome-devtools-mcp integration
 * Provides structured logging and monitoring for key app functions
 */

// Debug categories for organized logging
export const DEBUG_CATEGORIES = {
  AUTH: '🔐 AUTH',
  PROFILE: '👤 PROFILE', 
  ONBOARDING: '🚀 ONBOARDING',
  WORKOUT: '💪 WORKOUT',
  DATABASE: '🗄️ DATABASE',
  PERFORMANCE: '⚡ PERFORMANCE',
  ERROR: '❌ ERROR',
  SUCCESS: '✅ SUCCESS'
} as const;

// Enhanced logger with structured output for MCP monitoring
class AppDebugger {
  private static instance: AppDebugger;
  private logs: Array<{
    category: string;
    message: string;
    data?: any;
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'success';
  }> = [];

  static getInstance(): AppDebugger {
    if (!AppDebugger.instance) {
      AppDebugger.instance = new AppDebugger();
    }
    return AppDebugger.instance;
  }

  private formatMessage(category: string, message: string, data?: any, level: 'info' | 'warn' | 'error' | 'success' = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      category,
      message,
      data,
      timestamp,
      level
    };

    this.logs.push(logEntry);

    // Keep only last 100 logs to prevent memory issues
    if (this.logs.length > 100) {
      this.logs.shift();
    }

    const prefix = `[${timestamp}] ${category}`;
    const fullMessage = data ? `${prefix} ${message}` : `${prefix} ${message}`;
    
    return { logEntry, fullMessage };
  }

  info(category: string, message: string, data?: any) {
    const { logEntry, fullMessage } = this.formatMessage(category, message, data, 'info');
    console.log(fullMessage, data || '');
    return logEntry;
  }

  success(category: string, message: string, data?: any) {
    const { logEntry, fullMessage } = this.formatMessage(category, message, data, 'success');
    console.log(fullMessage, data || '');
    return logEntry;
  }

  warn(category: string, message: string, data?: any) {
    const { logEntry, fullMessage } = this.formatMessage(category, message, data, 'warn');
    console.warn(fullMessage, data || '');
    return logEntry;
  }

  error(category: string, message: string, data?: any) {
    const { logEntry, fullMessage } = this.formatMessage(category, message, data, 'error');
    console.error(fullMessage, data || '');
    return logEntry;
  }

  // Get all logs for MCP analysis
  getAllLogs() {
    return [...this.logs];
  }

  // Get logs by category
  getLogsByCategory(category: string) {
    return this.logs.filter(log => log.category === category);
  }

  // Get recent errors
  getRecentErrors(minutes: number = 5) {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.logs.filter(log => 
      log.level === 'error' && new Date(log.timestamp) > cutoff
    );
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    console.clear();
  }
}

export const appDebugger = AppDebugger.getInstance();

// Performance monitoring utilities
export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static startTimer(label: string) {
    this.timers.set(label, performance.now());
    appDebugger.info(DEBUG_CATEGORIES.PERFORMANCE, `Timer started: ${label}`);
  }

  static endTimer(label: string) {
    const start = this.timers.get(label);
    if (start) {
      const duration = performance.now() - start;
      this.timers.delete(label);
      appDebugger.info(DEBUG_CATEGORIES.PERFORMANCE, `Timer ended: ${label}`, { duration: `${duration.toFixed(2)}ms` });
      return duration;
    }
    appDebugger.warn(DEBUG_CATEGORIES.PERFORMANCE, `Timer not found: ${label}`);
    return null;
  }

  static measureAsync<T>(label: string, asyncFn: () => Promise<T>): Promise<T> {
    this.startTimer(label);
    return asyncFn()
      .then(result => {
        this.endTimer(label);
        return result;
      })
      .catch(error => {
        this.endTimer(label);
        throw error;
      });
  }
}

// Database operation monitoring
export const DatabaseMonitor = {
  logQuery(operation: string, table: string, data?: any) {
    appDebugger.info(DEBUG_CATEGORIES.DATABASE, `${operation} on ${table}`, data);
  },

  logQuerySuccess(operation: string, table: string, result?: any) {
    appDebugger.success(DEBUG_CATEGORIES.DATABASE, `${operation} on ${table} - SUCCESS`, result);
  },

  logQueryError(operation: string, table: string, error: any) {
    appDebugger.error(DEBUG_CATEGORIES.DATABASE, `${operation} on ${table} - FAILED`, {
      error: error.message,
      code: error.code,
      details: error.details
    });
  }
};

// Global debugging functions for console access
declare global {
  interface Window {
    gymDebug: {
      debugger: AppDebugger;
      performance: typeof PerformanceMonitor;
      database: typeof DatabaseMonitor;
      categories: typeof DEBUG_CATEGORIES;
      // Convenience functions
      getLogs: () => any[];
      getErrors: (minutes?: number) => any[];
      clearLogs: () => void;
      monitorOnboarding: () => void;
      monitorProfile: () => void;
      testProfileDiagnostics: () => Promise<void>;
    };
  }
}

// Initialize global debugging interface
if (typeof window !== 'undefined') {
  window.gymDebug = {
    debugger: appDebugger,
    performance: PerformanceMonitor,
    database: DatabaseMonitor,
    categories: DEBUG_CATEGORIES,
    
    // Convenience functions
    getLogs: () => appDebugger.getAllLogs(),
    getErrors: (minutes = 5) => appDebugger.getRecentErrors(minutes),
    clearLogs: () => appDebugger.clearLogs(),
    
    // Specific monitoring functions
    monitorOnboarding: () => {
      appDebugger.info(DEBUG_CATEGORIES.ONBOARDING, 'Onboarding monitoring activated');
      console.log('🎯 Onboarding monitoring active. Complete onboarding flow to see detailed logs.');
    },
    
    monitorProfile: () => {
      appDebugger.info(DEBUG_CATEGORIES.PROFILE, 'Profile monitoring activated');
      console.log('👤 Profile monitoring active. Profile operations will be logged.');
    },
    
    testProfileDiagnostics: async () => {
      appDebugger.info(DEBUG_CATEGORIES.PROFILE, 'Running profile diagnostics test');
      // Import and run profile diagnostics
      try {
        const { ProfileDiagnostics } = await import('./profileDiagnostics');
        const { supabase } = await import('./supabase');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await ProfileDiagnostics.runFullDiagnostic(user.id);
        } else {
          appDebugger.error(DEBUG_CATEGORIES.PROFILE, 'No authenticated user for diagnostics');
        }
      } catch (error) {
        appDebugger.error(DEBUG_CATEGORIES.PROFILE, 'Failed to run profile diagnostics', error);
      }
    }
  };

  // Log initialization
  console.log('🔧 Gym Tracker Debug Tools Loaded');
  console.log('📊 Access via: window.gymDebug');
  console.log('💡 Quick commands:');
  console.log('  - gymDebug.getLogs() - Get all debug logs');
  console.log('  - gymDebug.getErrors() - Get recent errors');
  console.log('  - gymDebug.monitorOnboarding() - Monitor onboarding flow');
  console.log('  - gymDebug.testProfileDiagnostics() - Test profile diagnostics');
}