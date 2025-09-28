/**
 * MCP Chrome DevTools Connection Test
 * Run this in Chrome DevTools Console to verify connection
 */

// Test basic Chrome DevTools API availability
function testChromeDevToolsAPIs() {
  console.group('🔍 MCP Chrome DevTools - Connection Test');
  
  const apis = {
    'Console API': typeof console !== 'undefined',
    'Performance API': typeof performance !== 'undefined',
    'Navigator API': typeof navigator !== 'undefined',
    'Window object': typeof window !== 'undefined',
    'Document object': typeof document !== 'undefined'
  };

  console.table(apis);

  // Test if our debugging tools loaded
  console.log('🔧 Gym Debug Tools:', {
    'gymDebug available': typeof window.gymDebug !== 'undefined',
    'mcpMonitoring available': typeof window.mcpMonitoring !== 'undefined'
  });

  // Test basic functionality
  if (window.gymDebug) {
    console.log('✅ Gym Debug Tools - Ready');
    console.log('📊 Current logs count:', window.gymDebug.getLogs().length);
  } else {
    console.warn('⚠️ Gym Debug Tools - Not loaded yet (may still be loading)');
  }

  if (window.mcpMonitoring) {
    console.log('✅ MCP Monitoring - Ready');
  } else {
    console.warn('⚠️ MCP Monitoring - Not loaded yet');
  }

  console.groupEnd();
}

// Test network connectivity
function testNetworkConnectivity() {
  console.group('🌐 Network Connectivity Test');
  
  // Test if we can make basic requests
  fetch(window.location.origin)
    .then(response => {
      console.log('✅ Basic network connectivity: OK');
      console.log('📡 Response status:', response.status);
    })
    .catch(error => {
      console.error('❌ Network connectivity issue:', error);
    });

  console.groupEnd();
}

// Test app state
function testAppState() {
  console.group('📱 App State Test');
  
  console.log('🔍 Current URL:', window.location.href);
  console.log('🔍 User Agent:', navigator.userAgent);
  console.log('🔍 React Dev Tools:', typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined');
  
  // Test if React app is mounted
  const reactRoot = document.querySelector('#root');
  console.log('🔍 React Root Element:', !!reactRoot);
  
  if (reactRoot) {
    console.log('📊 React Root Children:', reactRoot.children.length);
  }

  console.groupEnd();
}

// Complete diagnostic
function runMCPDiagnostics() {
  console.clear();
  console.log('🚀 MCP Chrome DevTools - Full Diagnostic');
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  testChromeDevToolsAPIs();
  testNetworkConnectivity();
  testAppState();
  
  console.log('🎯 Next Steps:');
  console.log('1. Verify all APIs show as available');
  console.log('2. Wait 2-3 seconds for debug tools to load');
  console.log('3. Re-run: runMCPDiagnostics()');
  console.log('4. If still issues, check MCP server config');
}

// Export for global access
window.runMCPDiagnostics = runMCPDiagnostics;
window.testChromeDevToolsAPIs = testChromeDevToolsAPIs;

// Auto-run on load
runMCPDiagnostics();