/**
 * MCP Chrome DevTools Integration Configuration
 * Provides specific monitoring setups for chrome-devtools-mcp
 */

export const MCP_MONITORING_CONFIG = {
  // Key API endpoints to monitor
  ENDPOINTS: [
    '/rest/v1/profile',
    '/rest/v1/plans', 
    '/rest/v1/workouts',
    '/rest/v1/exercises',
    '/rest/v1/weight_logs'
  ],

  // Console log patterns for MCP filtering
  LOG_PATTERNS: {
    ONBOARDING: /🚀 ONBOARDING|onboarding/i,
    PROFILE: /👤 PROFILE|profile/i,
    WORKOUT: /💪 WORKOUT|workout/i,
    DATABASE: /🗄️ DATABASE|database/i,
    ERROR: /❌ ERROR|error/i,
    SUCCESS: /✅ SUCCESS|success/i,
    PERFORMANCE: /⚡ PERFORMANCE|performance/i
  },

  // Network request monitoring
  NETWORK_MONITORING: {
    // Supabase API calls
    SUPABASE_PATTERNS: [
      /supabase\.co\/rest\/v1\/profile/,
      /supabase\.co\/rest\/v1\/plans/,
      /supabase\.co\/rest\/v1\/workouts/,
      /supabase\.co\/rest\/v1\/exercises/,
      /supabase\.co\/rest\/v1\/weight_logs/
    ],
    
    // Auth endpoints
    AUTH_PATTERNS: [
      /supabase\.co\/auth\/v1\/token/,
      /supabase\.co\/auth\/v1\/user/,
      /supabase\.co\/auth\/v1\/signup/,
      /supabase\.co\/auth\/v1\/signin/
    ]
  },

  // Performance thresholds for alerts
  PERFORMANCE_THRESHOLDS: {
    ONBOARDING_COMPLETION: 5000, // 5 seconds
    PROFILE_UPDATE: 2000,        // 2 seconds
    WORKOUT_PLAN_CREATION: 3000, // 3 seconds
    PAGE_LOAD: 3000,             // 3 seconds
    API_RESPONSE: 1000           // 1 second
  },

  // Error patterns to watch for
  ERROR_PATTERNS: {
    PROFILE_ISSUES: [
      /profile.*not.*found/i,
      /profile.*update.*failed/i,
      /profile.*creation.*failed/i
    ],
    
    DATABASE_ISSUES: [
      /relation.*does.*not.*exist/i,
      /timeout/i,
      /connection.*failed/i,
      /PGRST116/i
    ],
    
    AUTH_ISSUES: [
      /auth.*failed/i,
      /token.*expired/i,
      /unauthorized/i,
      /invalid.*session/i
    ]
  }
};

// MCP-specific monitoring functions
export const MCPMonitoring = {
  
  // Start comprehensive monitoring session
  startSession() {
    console.group('🔧 MCP Chrome DevTools - Gym Tracker Monitoring Session Started');
    console.log('📊 Monitoring Categories:', Object.keys(MCP_MONITORING_CONFIG.LOG_PATTERNS));
    console.log('🌐 Network Patterns:', MCP_MONITORING_CONFIG.NETWORK_MONITORING);
    console.log('⚡ Performance Thresholds:', MCP_MONITORING_CONFIG.PERFORMANCE_THRESHOLDS);
    console.groupEnd();
    
    // Set up global error handling
    window.addEventListener('error', (event) => {
      console.error('🚨 Global Error Detected:', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise
      });
    });
  },

  // Monitor specific user flow
  monitorOnboardingFlow() {
    console.group('🎯 MCP Monitoring: Onboarding Flow');
    console.log('Monitoring onboarding completion process...');
    console.log('Watch for:');
    console.log('  - Profile update attempts');
    console.log('  - Workout plan creation');
    console.log('  - Database operations');
    console.log('  - Performance metrics');
    console.groupEnd();

    // Add performance observer for navigation
    if (typeof PerformanceObserver !== 'undefined') {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('📊 Navigation Performance:', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              firstPaint: navEntry.loadEventEnd - navEntry.fetchStart
            });
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['navigation'] });
      } catch (e) {
        console.warn('Performance Observer not supported:', e);
      }
    }
  },

  // Generate monitoring report
  generateReport() {
    if (window.gymDebug) {
      const logs = window.gymDebug.getLogs();
      const errors = window.gymDebug.getErrors(10); // Last 10 minutes

      console.group('📋 MCP Monitoring Report');
      console.log('📊 Total Log Entries:', logs.length);
      console.log('❌ Recent Errors:', errors.length);
      
      if (errors.length > 0) {
        console.group('🚨 Recent Errors:');
        errors.forEach(error => {
          console.error(`[${error.timestamp}] ${error.category}: ${error.message}`, error.data);
        });
        console.groupEnd();
      }

      // Performance summary
      const perfLogs = logs.filter(log => log.category.includes('PERFORMANCE'));
      if (perfLogs.length > 0) {
        console.group('⚡ Performance Summary:');
        perfLogs.forEach(log => {
          console.log(`${log.message}:`, log.data);
        });
        console.groupEnd();
      }

      console.groupEnd();
      
      return { logs, errors, performance: perfLogs };
    } else {
      console.warn('GymDebug not available for report generation');
      return null;
    }
  },

  // Export logs for MCP analysis
  exportForMCP() {
    const report = this.generateReport();
    if (report) {
      const exportData = {
        timestamp: new Date().toISOString(),
        session: 'gym-tracker-debugging',
        ...report
      };
      
      console.log('📤 MCP Export Data:', exportData);
      
      // Copy to clipboard if possible
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
          .then(() => console.log('✅ Export data copied to clipboard'))
          .catch(() => console.log('❌ Failed to copy to clipboard'));
      }
      
      return exportData;
    }
    return null;
  }
};

// Auto-initialize if in development
if (import.meta.env.DEV && typeof window !== 'undefined') {
  // Wait for DOM and other debug tools to load
  setTimeout(() => {
    MCPMonitoring.startSession();
    
    // Add global MCP functions
    (window as any).mcpMonitoring = MCPMonitoring;
    
    console.log('🔧 MCP Monitoring Commands:');
    console.log('  mcpMonitoring.monitorOnboardingFlow() - Start onboarding monitoring');
    console.log('  mcpMonitoring.generateReport() - Generate current session report');  
    console.log('  mcpMonitoring.exportForMCP() - Export data for MCP analysis');
  }, 1000);
}

export default MCP_MONITORING_CONFIG;