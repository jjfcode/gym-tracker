# 🔧 MCP Chrome DevTools Integration

This setup provides comprehensive debugging and monitoring for the Gym Tracker app using the `chrome-devtools-mcp` server.

## 🚀 Quick Start

### 1. **Open Chrome DevTools**
```bash
F12 → Console Tab
```

### 2. **Available Debug Commands**

#### **Global Debugging:**
```javascript
// Get all debug logs
gymDebug.getLogs()

// Get recent errors (last 5 minutes)
gymDebug.getErrors()

// Clear all logs
gymDebug.clearLogs()

// Test profile diagnostics
gymDebug.testProfileDiagnostics()
```

#### **MCP-Specific Monitoring:**
```javascript
// Start onboarding flow monitoring
mcpMonitoring.monitorOnboardingFlow()

// Generate session report
mcpMonitoring.generateReport()

// Export data for MCP analysis
mcpMonitoring.exportForMCP()
```

### 3. **Monitor Key Flows**

#### **Profile Completion Issues:**
```javascript
// Start monitoring
gymDebug.monitorProfile()

// Complete onboarding and watch console for:
// 👤 PROFILE: Profile update attempt 1/3
// 👤 PROFILE: Profile updated successfully
// ✅ SUCCESS: Profile completion verified
```

#### **Workout Plan Creation:**
```javascript
// Monitor onboarding
mcpMonitoring.monitorOnboardingFlow()

// Complete onboarding flow and watch for:
// 💪 WORKOUT: Creating workout plan based on preferences  
// 💪 WORKOUT: Selected workout template
// ✅ SUCCESS: Workout plan created successfully
```

## 📊 **MCP Integration Features**

### **Structured Logging**
- **Categories:** AUTH, PROFILE, ONBOARDING, WORKOUT, DATABASE, PERFORMANCE
- **Levels:** info, warn, error, success
- **Timestamps:** ISO format for precise tracking
- **Data Context:** Relevant data objects attached to each log

### **Performance Monitoring**
- **Timer Functions:** Start/end timers for operations
- **Automatic Tracking:** Onboarding completion, profile updates, workout creation
- **Thresholds:** Configurable performance alerts
- **Navigation Metrics:** Page load performance data

### **Error Tracking**
- **Categorized Errors:** Profile, database, authentication issues
- **Recent Error Analysis:** Last N minutes of errors
- **Pattern Matching:** Common error scenarios identified
- **Context Preservation:** Full error objects with stack traces

### **Network Monitoring**
- **Supabase API Calls:** All database operations tracked
- **Authentication Requests:** Token refresh, login/logout
- **Performance Metrics:** Response times and status codes
- **Error Patterns:** Failed requests with detailed context

## 🎯 **Specific Use Cases**

### **Debug Profile Completion:**
```javascript
// 1. Start monitoring
gymDebug.monitorProfile()

// 2. Complete onboarding
// 3. Check results
gymDebug.getErrors() // Any profile-related errors?
gymDebug.getLogsByCategory('👤 PROFILE') // Profile operation logs
```

### **Debug Workout Plan Creation:**
```javascript
// 1. Start comprehensive monitoring  
mcpMonitoring.monitorOnboardingFlow()

// 2. Complete onboarding with:
//    - Goal: Weight Loss
//    - Experience: Beginner  
//    - Frequency: 3 days/week

// 3. Check results
mcpMonitoring.generateReport() // Full session analysis
```

### **Performance Analysis:**
```javascript
// Check recent performance metrics
gymDebug.getLogs().filter(log => log.category.includes('PERFORMANCE'))

// Export for deeper MCP analysis
const data = mcpMonitoring.exportForMCP()
console.log('Performance data:', data.performance)
```

## 🔍 **What to Look For**

### **Successful Onboarding Flow:**
```
🚀 ONBOARDING: Starting onboarding completion
⚡ PERFORMANCE: Timer started: onboarding-completion
👤 PROFILE: Profile update attempt 1/3
✅ SUCCESS: Profile updated successfully  
💪 WORKOUT: Creating workout plan based on preferences
💪 WORKOUT: Selected workout template
⚡ PERFORMANCE: Timer ended: workout-plan-creation (1250.45ms)
✅ SUCCESS: Workout plan created successfully
⚡ PERFORMANCE: Timer ended: onboarding-completion (3847.22ms)
```

### **Common Issues to Debug:**
- **Profile Update Failures:** Look for PGRST116 errors or timeout messages
- **Template Selection Issues:** Missing templates for workout frequency
- **Database Connection Problems:** Supabase connection timeouts
- **Performance Bottlenecks:** Operations taking longer than thresholds

## 💡 **MCP Chrome DevTools Benefits**

With this setup, you can:
- **Real-time debugging** of user flows
- **Performance monitoring** with automatic timing
- **Error pattern detection** across sessions
- **Structured data export** for analysis
- **Network request tracking** for API issues
- **Console log filtering** by category and severity

The MCP server can now easily filter, analyze, and provide insights on your gym tracker's debugging data in real-time!